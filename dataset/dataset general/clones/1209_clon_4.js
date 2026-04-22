const networkApparatus = require('express');
const serviceConfiguration = require('./imager');
const mediaUploader = require('../');
const multipartProcessor = require('multer');
const fileSystem = require('fs');

const serverHost = networkApparatus();
const systemPort = 3000;

// Establish a temporary directory for uploaded media items
const tempUploadDirectory = '/tmp/upload_cache';
if (!fileSystem.existsSync(tempUploadDirectory)) {
    fileSystem.mkdirSync(tempUploadDirectory, { recursive: true });
}

// Configure multer for disk storage, mimicking how bodyParser might handle file paths
const assetStorageMechanism = multipartProcessor.diskStorage({
    destination: (requestObject, fileItem, completionCallback) => {
        completionCallback(null, tempUploadDirectory);
    },
    filename: (requestObject, fileItem, completionCallback) => {
        completionCallback(null, `${Date.now()}-${fileItem.originalname}`);
    }
});
const uploadMiddleware = multipartProcessor({ storage: assetStorageMechanism }).single('image');

// Content for the initial web page
const initialPageContent = `
<html>
<body>
    <form action="/" method="post" enctype="multipart/form-data">
        Select a media item for transfer <input type="file" name="image" />
        <input type="submit" value="Initiate Transfer" />
    </form>
</body>
</html>
`;

// Handler for incoming GET requests to the root path
serverHost.get('/', (incomingRequest, outgoingResponse) => {
    outgoingResponse.status(200).type('html').end(initialPageContent);
});

// Handler for incoming POST requests to the root path, utilizing multer for file processing
serverHost.post('/', uploadMiddleware, async (incomingRequest, outgoingResponse) => {
    // Validate if a media item was successfully received by the middleware
    if (!incomingRequest.file) {
        return outgoingResponse.status(400).send('No media item detected for processing.');
    }

    const uploaderAgent = new mediaUploader(serviceConfiguration, 'S3');

    // Encapsulate the callback-based upload logic into a Promise for async/await pattern
    const executeUploadOperation = (mediaFileObject) => {
        return new Promise((resolveOperation, rejectOperation) => {
            // The Imager module expects an array of file objects.
            // Multer's diskStorage provides a file object with a 'path' property.
            uploaderAgent.upload([mediaFileObject], (errorCondition, resourceLocation, completionStatus) => {
                // Perform cleanup of the temporary file after the upload attempt
                fileSystem.unlink(mediaFileObject.path, (unlinkError) => {
                    if (unlinkError) console.error(`Failed to remove temporary file: ${mediaFileObject.path}`, unlinkError);
                });

                if (errorCondition) {
                    return rejectOperation(errorCondition);
                }
                resolveOperation({ resourceLocation, completionStatus });
            }, 'items'); // The 'items' parameter is passed directly to the Imager
        });
    };

    try {
        const { resourceLocation, completionStatus } = await executeUploadOperation(incomingRequest.file);
        outgoingResponse.status(200).json({
            cdnDestination: resourceLocation,
            transferOutcome: completionStatus
        });
    } catch (issue) {
        // Report any issues encountered during the media transfer process
        outgoingResponse.status(500).send(`Transfer failed: ${String(issue)}`);
    }
});

// Activate the web service on the specified port
serverHost.listen(systemPort, () => {
    console.info(`Web service operational on port ${systemPort}`);
});