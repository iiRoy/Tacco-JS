const webServer = require('express');
const multipartHandler = require('multer'); // Modern approach for file uploads
const uploadConfiguration = require('./image_settings'); // Renamed config file
const CloudAssetManager = require('../'); // Renamed main library

// Initialize the core application instance
const applicationInstance = webServer();

// Define a directory for temporary file storage during upload processing
const temporaryStorageLocation = 'temp_uploads/'; // Multer will save files here temporarily
const fileUploadProcessor = multipartHandler({ dest: temporaryStorageLocation });

// --- Route for handling asset uploads (POST request) ---
// This route now uses the configured multer middleware for single file processing.
applicationInstance.post('/upload-asset', fileUploadProcessor.single('media_file_input'), (incomingRequest, outgoingResponse) => {
  // A brief check to ensure a file was actually provided via the form
  if (!incomingRequest.file) {
    console.warn('Upload attempt without a file detected.');
    return outgoingResponse.status(400).json({
      operationStatus: 'failure',
      message: 'No file payload found. Please select a file for upload.'
    });
  }

  // Define the target storage zone/category for the uploaded assets
  const assetCategory = 'product_visuals'; // Renamed from 'items' for clarity

  // Instantiate the cloud asset handler with specific settings and target service
  const currentAssetProcessor = new CloudAssetManager(uploadConfiguration, 'CLOUD_STORAGE_PROVIDER_S3'); // Renamed 'S3'

  // Log the incoming file details for debugging/auditing
  console.log(`Attempting to upload file: ${incomingRequest.file.originalname} (MIME: ${incomingRequest.file.mimetype})`);

  // Execute the file transfer operation
  // Note: The original expected an array `[req.files.image]`, multer provides `req.file` directly.
  currentAssetProcessor.transferFile([incomingRequest.file], (uploadIssue, finalAssetUrl, assetMetadata) => {
    // Check for any errors during the upload process
    if (uploadIssue) {
      console.error('Cloud asset upload encountered an issue:', uploadIssue);
      // Return a detailed error response
      return outgoingResponse.status(500).json({
        operationStatus: 'error',
        details: uploadIssue.message || 'An unexpected error occurred during asset transfer.'
      });
    }

    // If the upload was successful, respond with the details
    console.info(`Successfully uploaded asset to: ${finalAssetUrl}`);
    outgoingResponse.status(200).json({
      operationStatus: 'success',
      cloudUrl: finalAssetUrl, // Renamed from cdnUri
      assetInformation: assetMetadata // Renamed from uploaded
    });
  }, assetCategory); // Pass the defined asset category
});

// --- Route for serving the file upload form (GET request) ---
applicationInstance.get('/upload-form', (incomingRequest, outgoingResponse) => {
  // Construct the HTML content using a template literal for better readability
  const uploadFormHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Asset Upload Interface</title>
        <style>
            body { font-family: sans-serif; margin: 2em; background-color: #f4f4f4; }
            form { background-color: white; padding: 2em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; margin: auto; }
            input[type="file"] { margin-bottom: 1em; padding: 0.5em; border: 1px solid #ccc; border-radius: 4px; }
            input[type="submit"] { background-color: #007bff; color: white; padding: 0.7em 1.5em; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
            input[type="submit"]:hover { background-color: #0056b3; }
        </style>
    </head>
    <body>
        <form action="/upload-asset" method="post" enctype="multipart/form-data">
            <h2>Upload a New Asset</h2>
            <p>Select a file from your local system to transfer to the cloud storage:</p>
            <input type="file" name="media_file_input" id="assetFile" accept="image/*" />
            <br/>
            <input type="submit" value="Initiate Upload" />
        </form>
    </body>
    </html>
  `;
  // Set content type and send the HTML
  outgoingResponse.contentType('text/html').status(200).send(uploadFormHtml);
});

// --- Start the web server ---
const servicePort = 3001; // Changed port number for distinction
applicationInstance.listen(servicePort, () => {
  // Provide a more detailed startup message
  console.info(`🚀 Cloud Asset Management Service is operational on http://localhost:${servicePort}`);
  console.info(`Access the upload form at: http://localhost:${servicePort}/upload-form`);
  console.info(`POST file uploads to: http://localhost:${servicePort}/upload-asset`);
});