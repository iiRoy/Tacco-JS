const webServer = require('express');
const serverInstance = webServer();
const fileIO = require('fs');
const cloudStorageService = require('knox'); // Renamed 'knox' to 'cloudStorageService'
const processStream = require('stream'); // Renamed 'Stream' to 'processStream'
const vectorConversionTool = require('inkscape'); // Renamed 'Inkscape' to 'vectorConversionTool'

// Middleware setup for the web server.
// Modern Express applications use direct `app.use` calls instead of `app.configure`.
serverInstance.use(webServer.static(__dirname + '/public_assets')); // Serving static assets from 'public_assets'
serverInstance.use(webServer.json({ limit: '5mb' })); // Parse JSON payloads, added size limit
serverInstance.use(webServer.urlencoded({ extended: true, limit: '5mb' })); // Parse URL-encoded payloads

// Initialize the cloud storage client.
let cloudObjectClient;
const isEnvironmentConfigured = process.env['CLOUD_ACCESS_KEY_ID_ENV']; // New helper variable for clarity
if (isEnvironmentConfigured) {
    cloudObjectClient = cloudStorageService.createClient({
        key: process.env['CLOUD_ACCESS_KEY_ID_ENV'],
        secret: process.env['CLOUD_SECRET_ACCESS_KEY_ENV'],
        bucket: process.env['CLOUD_STORAGE_BUCKET_NAME_ENV']
    });
    console.log('Cloud storage client initialized using environment variables.');
} else {
    // Fallback to local configuration file if environment variables are not set.
    const applicationSettings = require('./server_config'); // Renamed 'conf' to 'server_config'
    cloudObjectClient = cloudStorageService.createClient(applicationSettings.cloudServiceCredentials); // Renamed 'aws' to 'cloudServiceCredentials'
    console.log('Cloud storage client initialized from local configuration file.');
}

// Define the main POST route for vector image processing.
serverInstance.post('/convert-image-data', async (incomingRequest, serverResponse) => { // Renamed '/', req, res
    // Guard clause: Validate incoming request body for essential data.
    if (!incomingRequest.body || !incomingRequest.body.drawingId || !incomingRequest.body.svgData) {
        console.error('API Error: Request body missing required "drawingId" or "svgData".');
        return serverResponse.status(400).json({
            status: 'error',
            message: 'Invalid input: Please provide a drawingId and svgData in the request body.'
        });
    }

    const drawingIdentifier = incomingRequest.body.drawingId;
    const svgInputFileName = `${drawingIdentifier}.svg`;
    const pngOutputFileName = `${drawingIdentifier}.png`;

    const temporaryStoragePath = __dirname + '/temp_processing_files/'; // New variable for temp path
    // Ensure the temporary directory exists before writing files.
    if (!fileIO.existsSync(temporaryStoragePath)) {
        try {
            fileIO.mkdirSync(temporaryStoragePath, { recursive: true });
            console.log(`Created temporary directory: ${temporaryStoragePath}`);
        } catch (dirError) {
            console.error(`Failed to create temporary directory ${temporaryStoragePath}:`, dirError);
            return serverResponse.status(500).json({
                status: 'error',
                message: 'Server internal error: Could not prepare temporary storage.'
            });
        }
    }

    const fullSvgFilePath = temporaryStoragePath + svgInputFileName;
    const fullPngFilePath = temporaryStoragePath + pngOutputFileName;

    // Standard SVG XML declaration and DTD.
    const svgDocumentHeader = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    // Decode base64 SVG content. Using Buffer.from is the modern approach.
    const base64DecodedSvg = Buffer.from(incomingRequest.body.svgData, 'base64').toString('utf8');
    const completeSvgContent = svgDocumentHeader + base64DecodedSvg;

    console.log(`Initiating processing for drawing ID: ${drawingIdentifier}`);

    try {
        // Asynchronously write the SVG content to a temporary file.
        await fileIO.promises.writeFile(fullSvgFilePath, completeSvgContent);
        console.log(`Temporary SVG file saved: ${fullSvgFilePath}`);

        // Perform SVG to PNG conversion and upload to cloud storage.
        await executeConversionAndUpload(fullSvgFilePath, fullPngFilePath, pngOutputFileName, cloudObjectClient);

        // Clean up temporary files after successful operation.
        await removeTemporaryFiles([fullSvgFilePath, fullPngFilePath]);

        // Respond with success message and generated PNG details.
        serverResponse.status(200).json({
            status: 'success',
            message: 'SVG successfully converted to PNG and uploaded to cloud storage.',
            drawingIdentifier: drawingIdentifier,
            generatedPngUrl: `https://${process.env['CLOUD_STORAGE_BUCKET_NAME_ENV'] || applicationSettings.cloudServiceCredentials.bucket}.s3.amazonaws.com/${pngOutputFileName}`
        });

    } catch (operationError) {
        console.error(`Processing Error for ID ${drawingIdentifier}:`, operationError);
        // Attempt to clean up even if an error occurred during processing.
        await removeTemporaryFiles([fullSvgFilePath, fullPngFilePath])
            .catch(cleanupErr => console.warn(`Error during post-error cleanup for ID ${drawingIdentifier}:`, cleanupErr.message));

        serverResponse.status(500).json({
            status: 'error',
            message: 'Internal server error during image conversion or upload.',
            details: operationError.message
        });
    }
});

/**
 * Helper function to manage the SVG to PNG conversion and subsequent cloud upload.
 * @param {string} sourceSvgPath - Full path to the temporary SVG file.
 * @param {string} targetPngPath - Full path where the PNG will be saved temporarily.
 * @param {string} uploadedPngName - The name the PNG will have in cloud storage.
 * @param {object} s3Client - The initialized cloud storage client instance.
 * @returns {Promise<void>} A promise that resolves upon successful conversion and upload.
 */
async function executeConversionAndUpload(sourceSvgPath, targetPngPath, uploadedPngName, s3Client) {
    return new Promise((resolve, reject) => {
        const pngOutputStream = fileIO.createWriteStream(targetPngPath);
        pngOutputStream.on('error', (streamErr) => reject(new Error(`PNG output stream error: ${streamErr.message}`)));

        pngOutputStream.on('close', () => {
            console.log(`PNG conversion complete. File saved to ${targetPngPath}. Initiating cloud upload.`);
            // Upload the generated PNG to cloud storage.
            s3Client.putFile(targetPngPath, uploadedPngName, { 'Content-Type': 'image/png', 'x-amz-acl': 'public-read' }, (uploadErr, uploadResponse) => { // Added public-read ACL
                if (uploadErr) {
                    return reject(new Error(`Cloud storage upload failed for ${uploadedPngName}: ${uploadErr.message}`));
                }
                if (uploadResponse) {
                    console.log(`PNG '${uploadedPngName}' successfully uploaded to cloud storage.`);
                    // It's good practice to consume the response stream even if not needed.
                    uploadResponse.resume();
                    uploadResponse.on('end', () => {
                        console.log('Cloud storage connection for upload closed cleanly.');
                        resolve();
                    });
                    uploadResponse.on('error', (responseStreamErr) => reject(new Error(`Error with cloud upload response stream: ${responseStreamErr.message}`)));
                } else {
                    reject(new Error('Cloud storage upload process finished without a valid response object.'));
                }
            });
        });

        const svgInputStream = fileIO.createReadStream(sourceSvgPath);
        svgInputStream.on('error', (streamErr) => reject(new Error(`SVG input stream error: ${streamErr.message}`)));

        // Pipe the SVG stream through Inkscape for conversion to PNG.
        svgInputStream
            .pipe(new vectorConversionTool(['-e', '-o'])) // '-o' for optimized SVG output (example modification)
            .on('error', (conversionErr) => reject(new Error(`Inkscape conversion error: ${conversionErr.message}`)))
            .pipe(pngOutputStream);
    });
}

/**
 * Robust helper function to delete an array of temporary files.
 * @param {string[]} pathsToDelete - An array of full file paths to be deleted.
 * @returns {Promise<void>} A promise that resolves after attempting to delete all files.
 */
async function removeTemporaryFiles(pathsToDelete) {
    console.log('Starting temporary file cleanup procedure.');
    for (const filePath of pathsToDelete) {
        try {
            if (fileIO.existsSync(filePath)) { // Check if file exists before attempting unlink.
                await fileIO.promises.unlink(filePath);
                console.log(`Successfully removed temporary file: ${filePath}`);
            } else {
                console.log(`Temporary file not found, skipping removal: ${filePath}`);
            }
        } catch (cleanupError) {
            // Log a warning but don't fail the entire cleanup process for one file.
            console.warn(`Warning: Could not delete temporary file ${filePath}: ${cleanupError.message}`);
        }
    }
}

// Server startup configuration.
const APPLICATION_LISTEN_PORT = process.env['APP_SERVER_PORT'] || 6666; // Renamed PORT, changed default value.
exports.initializeApplicationService = function() { // Renamed 'startServer'
    console.log(`Application Service: Initializing vector image processing server on port ${APPLICATION_LISTEN_PORT}`);
    return serverInstance.listen(APPLICATION_LISTEN_PORT, () => {
        console.log(`Web server successfully launched and accessible at http://localhost:${APPLICATION_LISTEN_PORT}`);
    });
};

// Immediately start the application service upon script execution.
exports.initializeApplicationService();