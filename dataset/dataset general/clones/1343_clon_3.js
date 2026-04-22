var webFramework = require('express');
var webApp = webFramework();
var uploadManager = require('multer');
var graphicUtil = require('easyimage');
var path = require('path'); // Added for robust path handling

// --- Configuration Constants & Settings ---
const UPLOAD_DIRECTORY = './static/uploads/';
const LISTENING_PORT = 3000;
const PREFERRED_THUMBNAIL_WIDTH = 50;
const PREFERRED_THUMBNAIL_HEIGHT = 50;
const THUMBNAIL_IDENTIFIER = 'thumb_v2'; // A unique string to append for thumbnails
const ACCEPTED_GRAPHIC_FORMATS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']; // Added webp

// --- Utility Functions ---

/**
 * Extracts the file extension from a given filename or path.
 * @param {string} fullPath - The full path or filename.
 * @returns {string} The file extension (e.g., 'jpg', 'png'), or an empty string if none.
 */
function retrieveFileExtension(fullPath) {
    // Ensuring robustness: handles cases with multiple dots or no extension
    const baseName = path.basename(fullPath);
    const lastDotIndex = baseName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) { // No dot or dot at the beginning
        return '';
    }
    return baseName.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Generates a new filename by inserting a modifier before the file extension.
 * If no modifier is provided, a timestamp is used.
 * @param {string} originalFilePath - The original file path.
 * @param {string | number} [modifierString] - The string to insert before the extension.
 * @returns {string} The modified filename.
 */
function constructModifiedFilename(originalFilePath, modifierString) {
    const fileNameParts = originalFilePath.split('.');
    const fileExtension = fileNameParts.pop(); // Remove and store the last part (extension)
    const baseName = fileNameParts.join('.'); // Rejoin the rest of the parts
    const currentModifier = (modifierString !== undefined) ? modifierString : Date.now().toString();
    return `${baseName}.${currentModifier}.${fileExtension}`;
}

// --- Express Application Setup ---

// Middleware for handling file uploads
const uploadConfiguration = {
    // Where uploaded files will be stored temporarily
    dest: UPLOAD_DIRECTORY,
    // Custom logic to rename the file upon upload
    rename: function (fieldIdentifier, originalClientFilename) {
        // Sanitize filename to be URL-friendly and lowercase
        const sanitizedName = originalClientFilename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        // Append a timestamp to ensure uniqueness, then sanitize again
        const timestampedName = `${path.parse(sanitizedName).name}_${Date.now()}${path.parse(sanitizedName).ext}`;
        return timestampedName.replace(/[^a-zA-Z0-9.-]/g, '_'); // Final sanitize
    },
    // Optional: Add file size limits to prevent large uploads
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
};

webApp.use(uploadManager(uploadConfiguration));

// Serve static assets from the 'static' directory
webApp.use(webFramework.static(path.join(__dirname, 'static')));

// Define the API endpoint for file uploads
webApp.post('/api/file-upload', function (request, response) {
    // Basic validation for uploaded file presence
    if (!request.files || !request.files.userFile) {
        console.error('Upload error: No file received or field name mismatch.');
        return response.status(400).json({
            success: false,
            message: 'No file uploaded or incorrect field name. Expected "userFile".'
        });
    }

    const uploadedFileDetails = request.files.userFile;
    const uploadedOriginalName = uploadedFileDetails.originalname;
    const uploadedSystemName = uploadedFileDetails.name; // This is the name after multer's rename
    const uploadedTempPath = uploadedFileDetails.path;

    const fileSuffix = retrieveFileExtension(uploadedOriginalName);
    const isImageFormat = ACCEPTED_GRAPHIC_FORMATS.includes(fileSuffix);

    // Initial response object structure
    let apiResponse = {
        operationStatus: true,
        originalFileName: uploadedOriginalName,
        savedAsFileName: uploadedSystemName,
        wasImageProcessed: false,
        thumbnailGenerated: null
    };

    if (isImageFormat) {
        console.log(`Processing image: ${uploadedOriginalName} (temporary path: ${uploadedTempPath})`);

        // Define the destination path for the thumbnail
        const thumbnailDestinationPath = constructModifiedFilename(uploadedTempPath, THUMBNAIL_IDENTIFIER);

        // Perform image resizing and cropping
        graphicUtil.rescrop(
            {
                sourcePath: uploadedTempPath,
                destinationPath: thumbnailDestinationPath,
                targetWidth: PREFERRED_THUMBNAIL_WIDTH,
                targetHeight: PREFERRED_THUMBNAIL_HEIGHT
            },
            function (processingError, processedImageInfo) {
                if (processingError) {
                    console.error(`Image processing failed for ${uploadedOriginalName}:`, processingError);
                    // Send an error response for image processing failures
                    return response.status(500).json({
                        ...apiResponse,
                        operationStatus: false,
                        message: `Failed to create thumbnail: ${processingError.message}`
                    });
                }

                console.log(`Thumbnail created for ${uploadedOriginalName} at ${thumbnailDestinationPath}`);
                // Update response with thumbnail details
                apiResponse.wasImageProcessed = true;
                apiResponse.thumbnailGenerated = true;
                apiResponse.thumbnailPath = constructModifiedFilename(uploadedSystemName, THUMBNAIL_IDENTIFIER);
                apiResponse.processingDetails = {
                    width: processedImageInfo.width,
                    height: processedImageInfo.height,
                    format: processedImageInfo.format
                };
                response.json(apiResponse);
            }
        );
    } else {
        console.log(`File ${uploadedOriginalName} is not an allowed image format (${fileSuffix}). Skipping thumbnail generation.`);
        apiResponse.message = `File uploaded successfully, but not an accepted image format. No thumbnail created.`;
        response.json(apiResponse);
    }
});

// Start the HTTP server
const httpServerInstance = webApp.listen(LISTENING_PORT, function () {
    const serverAddress = httpServerInstance.address();
    console.log(`Web server initialized and listening on port: ${serverAddress.port}`);
    console.log(`Access static files at http://localhost:${serverAddress.port}/`);
    console.log(`Upload endpoint: http://localhost:${serverAddress.port}/api/file-upload`);
});

// Basic error handling for server startup
httpServerInstance.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${LISTENING_PORT} is already in use.`);
    } else {
        console.error(`An unhandled server error occurred: ${error.message}`);
    }
    process.exit(1); // Exit the process with an error code
});