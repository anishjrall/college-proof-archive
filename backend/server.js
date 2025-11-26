require('dotenv').config();
const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/database");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===== ROUTES =====

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// Login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt:", email);

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      console.log("❌ Invalid credentials for:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];
    console.log("✅ Login successful for:", user.name);
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});

// Upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log("📤 Upload request received:", req.body);
  console.log("📁 File info:", req.file);

  const {
    eventName,
    eventType,
    department,
    academicYear,
    proofType,
    description,
    userId,
    userRole,
  } = req.body;

  if (userRole !== "student") {
    return res.status(403).json({ error: "Only students can upload documents" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log(`📝 Uploading for user ID: ${userId}`);

  const eventQuery = `INSERT INTO events (event_name, event_type, department, academic_year, description, created_by) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    eventQuery,
    [eventName, eventType, department, academicYear, description, userId],
    (err, eventResult) => {
      if (err) {
        console.error("❌ Event creation error:", err);
        return res.status(500).json({ error: "Failed to create event: " + err.message });
      }

      const eventId = eventResult.insertId;
      console.log("✅ Event created! Event ID:", eventId);

      const proofQuery = `INSERT INTO proofs (event_id, proof_type, file_name, file_path, uploaded_by, document_type, status) 
                         VALUES (?, ?, ?, ?, ?, 'event_proof', 'pending')`;

      db.query(
        proofQuery,
        [eventId, proofType, req.file.originalname, req.file.filename, userId],
        (err, proofResult) => {
          if (err) {
            console.error("❌ Proof creation error:", err);
            return res.status(500).json({ error: "Failed to save document: " + err.message });
          }

          const proofId = proofResult.insertId;
          console.log("✅ Document uploaded successfully! Proof ID:", proofId);

          res.json({
            message: "Document uploaded successfully! Awaiting approval.",
            proofId: proofId,
            eventId: eventId,
            fileName: req.file.originalname,
            status: 'pending'
          });
        }
      );
    }
  );
});

// Update document status
app.put("/api/proofs/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason, userId, userRole } = req.body;

  console.log(`🔄 Status update request: Proof ${id} -> ${status}`);

  if (userRole !== 'staff' && userRole !== 'admin') {
    return res.status(403).json({ error: "Only staff/admin can update document status" });
  }

  let query = `UPDATE proofs SET status = ?`;
  const params = [status];

  if (status === 'rejected' && rejection_reason) {
    query += `, rejection_reason = ?`;
    params.push(rejection_reason);
  } else {
    query += `, rejection_reason = NULL`;
  }

  query += ` WHERE id = ?`;
  params.push(id);

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("❌ Status update error:", err);
      return res.status(500).json({ error: "Failed to update status: " + err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    console.log(`✅ Document ${id} status updated to: ${status}`);
    res.json({
      message: `Document ${status} successfully`,
      proofId: id,
      status: status
    });
  });
});

// File preview endpoint
app.get("/api/preview/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  console.log(`👀 File preview requested: ${filename}`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const ext = path.extname(filename).toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(filePath);
  } else if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    res.sendFile(filePath);
  } else {
    res.download(filePath);
  }
});

// Search route
app.get("/api/search", (req, res) => {
  const { studentUSN, userId, userRole, status } = req.query;
  console.log("🎯 SEARCH REQUEST:", { studentUSN, userId, userRole, status });

  if (!userId || !userRole) {
    return res.status(400).json({ error: "Missing user parameters" });
  }

  if (userRole === "student") {
    return res.status(403).json({ error: "Students cannot search other documents" });
  }

  let query = `
    SELECT 
      p.*, 
      COALESCE(e.event_name, 'Student Document') as event_name,
      COALESCE(e.event_type, 'Student Upload') as event_type,
      COALESCE(e.department, 'Student Department') as department,
      COALESCE(e.academic_year, '2024-25') as academic_year,
      COALESCE(e.description, 'Student uploaded document') as description,
      u.name as uploaded_by_name,
      u.email as student_usn,
      u.role as uploaded_by_role
    FROM proofs p 
    JOIN users u ON p.uploaded_by = u.id 
    LEFT JOIN events e ON p.event_id = e.id 
    WHERE u.role = 'student'
  `;

  const params = [];

  if (studentUSN && studentUSN.trim() !== '') {
    query += ` AND u.email LIKE ?`;
    params.push(`%${studentUSN.trim()}%`);
  }

  if (status && status !== 'all') {
    query += ` AND p.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY p.uploaded_at DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ SEARCH ERROR:", err);
      return res.status(500).json({ error: "Database query failed: " + err.message });
    }

    console.log(`✅ SEARCH COMPLETE: Found ${results.length} documents`);
    res.json(results);
  });
});

// Proofs route
app.get("/api/proofs", (req, res) => {
  const { userId, userRole, status } = req.query;
  console.log("📊 Fetching proofs for:", { userId, userRole, status });

  let query = `
    SELECT 
      p.*, 
      COALESCE(e.event_name, 'My Document') as event_name,
      COALESCE(e.event_type, 'Student Upload') as event_type,
      COALESCE(e.department, 'Student Department') as department,
      COALESCE(e.academic_year, '2024-25') as academic_year,
      COALESCE(e.description, 'Student uploaded document') as event_description,
      u.name as uploaded_by_name,
      u.email as student_email
    FROM proofs p 
    LEFT JOIN events e ON p.event_id = e.id 
    JOIN users u ON p.uploaded_by = u.id 
    WHERE 1=1
  `;

  const params = [];

  if (userRole === "student") {
    query += ` AND p.uploaded_by = ?`;
    params.push(userId);
  }

  if (status && status !== 'all') {
    query += ` AND p.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY p.uploaded_at DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Get proofs error:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("📊 Total proofs found:", results.length);
    res.json(results);
  });
});

// ===== ADMIN ROUTES =====

// Get admin statistics
app.get("/api/admin/stats", (req, res) => {
  console.log("📊 Admin stats requested");

  // Get total users count
  const usersQuery = "SELECT COUNT(*) as totalUsers FROM users";
  // Get total proofs count  
  const proofsQuery = "SELECT COUNT(*) as totalProofs FROM proofs";
  // Get total events count
  const eventsQuery = "SELECT COUNT(*) as totalEvents FROM events";

  // Execute all queries
  db.query(usersQuery, (err, usersResult) => {
    if (err) {
      console.error("❌ Users count error:", err);
      return res.status(500).json({ error: "Failed to get users count" });
    }

    db.query(proofsQuery, (err, proofsResult) => {
      if (err) {
        console.error("❌ Proofs count error:", err);
        return res.status(500).json({ error: "Failed to get proofs count" });
      }

      db.query(eventsQuery, (err, eventsResult) => {
        if (err) {
          console.error("❌ Events count error:", err);
          return res.status(500).json({ error: "Failed to get events count" });
        }

        const stats = {
          totalUsers: usersResult[0].totalUsers,
          totalProofs: proofsResult[0].totalProofs,
          totalEvents: eventsResult[0].totalEvents
        };

        console.log("📊 Admin stats:", stats);
        res.json(stats);
      });
    });
  });
});

// Get all users for admin
app.get("/api/admin/users", (req, res) => {
  console.log("👥 Admin users list requested");

  const query = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Users list error:", err);
      return res.status(500).json({ error: "Failed to get users list" });
    }

    console.log(`👥 Found ${results.length} users`);
    res.json(results);
  });
});

// Update user role
app.put("/api/admin/users/:id/role", (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  console.log(`🔄 Update user ${id} role to: ${role}`);

  if (!['admin', 'staff', 'student'].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const query = "UPDATE users SET role = ? WHERE id = ?";
  
  db.query(query, [role, id], (err, result) => {
    if (err) {
      console.error("❌ User role update error:", err);
      return res.status(500).json({ error: "Failed to update user role" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User ${id} role updated to: ${role}`);
    res.json({ message: "User role updated successfully", userId: id, newRole: role });
  });
});

app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:5000");
});