const cloudStorageClient = require("awssum-amazon-s3");
const httpDataFetcher = require("request");

// Utility function to log activities with a timestamp and level
const logActivity = (messageContent, messageLevel = 'INFO') => {
    const currentTimestamp = new Date().toISOString();
    console.log(`[${currentTimestamp}] [${messageLevel}] ${messageContent}`);
};

// Centralized error management routine
const manageOperationFailure = (issueDetails, terminateProcess = true) => {
    logActivity(`Critical System Error: ${issueDetails.message || issueDetails}`, 'ERROR');
    if (terminateProcess) {
        // New fragment: Exit the process upon encountering a fatal error
        process.exit(1);
    }
};

// Configuration container, populated from environment variables
const systemConfiguration = {
    // URL to retrieve primary content from
    dataAcquisitionEndpoint: process.env.DATA_SOURCE_URL,
    // Optional URL to ping upon successful operation completion
    successNotificationEndpoint: process.env.NOTIFICATION_DESTINATION,
    // AWS S3 bucket name for storage
    awsStorageBucket: process.env.AWS_STORAGE_BUCKET_NAME,
    // Key/path within the S3 bucket for the stored object
    awsStorageObjectKey: process.env.AWS_STORAGE_OBJECT_IDENTIFIER,
    // AWS credentials for S3 access
    awsAccessId: process.env.AWS_ACCESS_KEY_ID_VAR,
    awsSecretKey: process.env.AWS_SECRET_KEY_VAR
};

// New fragment: Pre-flight validation of essential configuration settings
const performConfigValidation = (configObject) => {
    const necessarySettings = [
        'dataAcquisitionEndpoint',
        'awsStorageBucket',
        'awsStorageObjectKey',
        'awsAccessId',
        'awsSecretKey'
    ];
    for (const settingName of necessarySettings) {
        if (!configObject[settingName]) {
            manageOperationFailure(new Error(`Mandatory configuration item missing: ${settingName}`));
        }
    }
    logActivity('All essential configuration parameters have been verified.');
};

// Execute configuration validation
performConfigValidation(systemConfiguration);

// AWS S3 client initialization (renamed variables, restructured config)
const s3ClientCredentials = {
    "accessKeyId": systemConfiguration.awsAccessId,
    "secretAccessKey": systemConfiguration.awsSecretKey,
    "region": cloudStorageClient.US_EAST_1 // AWS region constant
};
const s3DataUploader = new cloudStorageClient.S3(s3ClientCredentials);

// Promisified version of the HTTP data fetcher (Type III: rewritten for async/await)
const retrieveRemoteContent = (targetUri) => {
    return new Promise((resolve, reject) => {
        httpDataFetcher(targetUri, (fetchIssue, httpResponse, receivedBody) => {
            if (fetchIssue) {
                return reject(fetchIssue);
            }
            // New fragment: Add validation for HTTP response status codes
            if (httpResponse && httpResponse.statusCode >= 400) {
                return reject(new Error(`HTTP Status Error: ${httpResponse.statusCode} when accessing ${targetUri}`));
            }
            resolve(receivedBody);
        });
    });
};

// Promisified version of the S3 object upload (Type III: rewritten for async/await)
const uploadBlobToS3 = (uploadPayload) => {
    return new Promise((resolve, reject) => {
        s3DataUploader.PutObject(uploadPayload, (uploadIssue) => {
            if (uploadIssue) {
                return reject(uploadIssue);
            }
            resolve();
        });
    });
};

// Main operational sequence, rewritten using async/await for structural change
const executeDataIngestionProcess = async () => {
    let acquiredContentBuffer; // Intermediate helper variable

    try {
        logActivity(`Commencing data retrieval from: ${systemConfiguration.dataAcquisitionEndpoint}`);

        acquiredContentBuffer = await retrieveRemoteContent(systemConfiguration.dataAcquisitionEndpoint);

        // New fragment: Guard clause for empty or null content
        if (!acquiredContentBuffer || acquiredContentBuffer.length === 0) {
            logActivity('No content was retrieved from the source. S3 upload will be skipped.', 'WARN');
            if (systemConfiguration.successNotificationEndpoint) {
                logActivity('Attempting to notify the completion endpoint despite empty content.');
                await retrieveRemoteContent(systemConfiguration.successNotificationEndpoint);
                logActivity('Completion endpoint notified for empty content scenario.');
            }
            return; // Exit early if no content
        }

        const contentByteSize = Buffer.byteLength(acquiredContentBuffer); // Helper variable for content length
        logActivity(`Successfully acquired ${contentByteSize} bytes. Preparing for storage in S3.`);

        // S3 upload parameters (renamed properties)
        const s3UploadParameters = {
            ContainerId: systemConfiguration.awsStorageBucket,      // Renamed from BucketName
            BlobKey: systemConfiguration.awsStorageObjectKey,       // Renamed from ObjectName
            PayloadSize: contentByteSize,                           // Renamed from ContentLength
            BlobContent: acquiredContentBuffer                      // Renamed from Body
        };

        await uploadBlobToS3(s3UploadParameters);
        logActivity(`Data successfully stored in S3 bucket '${systemConfiguration.awsStorageBucket}' under key '${systemConfiguration.awsStorageObjectKey}'.`);

        // Conditional success notification (renamed, added logging)
        if (systemConfiguration.successNotificationEndpoint) {
            logActivity(`Triggering success notification at: ${systemConfiguration.successNotificationEndpoint}`);
            await retrieveRemoteContent(systemConfiguration.successNotificationEndpoint);
            logActivity('Success notification endpoint has been successfully triggered.');
        } else {
            // New fragment: Log if no notification endpoint is configured
            logActivity('No success notification endpoint was configured. Skipping notification step.');
        }

    } catch (processIssue) {
        // Catch any errors in the async flow and pass to central handler
        manageOperationFailure(processIssue);
    }
};

// Initiate the data ingestion process
logActivity('Starting the data transfer orchestration.');
executeDataIngestionProcess();
// Note: A final success log for the entire script would ideally be after this call,
// but due to async nature and potential process.exit(), it's better placed within the async function.
// For a fully successful, non-fatal run, the last log from within the async function confirms completion.