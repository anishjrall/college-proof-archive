import { useState } from 'react';

function FilePreview({ filePath, fileName }) {
    const [showPreview, setShowPreview] = useState(false);

    const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
    const isPDF = fileName.toLowerCase().endsWith('.pdf');

    return (
        <div className="relative">
            <button
                onClick={() => setShowPreview(true)}
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200"
            >
                👁️ Preview
            </button>

            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{fileName}</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4">
                            {isImage ? (
                                <img
                                    src={`http://localhost:5000/uploads/${filePath}`}
                                    alt={fileName}
                                    className="max-w-full max-h-[70vh] object-contain"
                                />
                            ) : isPDF ? (
                                <iframe
                                    src={`http://localhost:5000/uploads/${filePath}`}
                                    className="w-full h-96"
                                    title={fileName}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">📄</div>
                                    <p>Preview not available for this file type</p>
                                    <a
                                        href={`http://localhost:5000/uploads/${filePath}`}
                                        className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                                        download
                                    >
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FilePreview;