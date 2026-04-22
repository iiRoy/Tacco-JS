const networkFetcher = require('node-fetch');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const sourceAddress = process.env.SOURCE_RESOURCE_ADDRESS;
const completionAddress = process.env.COMPLETION_NOTIFICATION_ADDRESS;
const containerId = process.env.STORAGE_CONTAINER_IDENTIFIER;
const objectKey = process.env.STORAGE_OBJECT_KEY_NAME;

const manageOperationFailure = (issueDetails) => {
    console.error(issueDetails);
    throw issueDetails;
};

const orchestrateDataTransfer = async () => {
    let payloadContent;

    try {
        const responseObject = await networkFetcher(sourceAddress);
        if (!responseObject.ok) {
            throw new Error(`HTTP retrieval unsuccessful: ${responseObject.statusText} (${responseObject.status})`);
        }
        payloadContent = await responseObject.text();
    } catch (issue) {
        return manageOperationFailure(issue);
    }

    const cloudStorageKit = new S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.CLOUD_ACCESS_CREDENTIAL,
            secretAccessKey: process.env.CLOUD_SECRET_CREDENTIAL,
        },
    });

    try {
        const uploadDirective = new PutObjectCommand({
            Bucket: containerId,
            Key: objectKey,
            Body: payloadContent,
            ContentLength: Buffer.byteLength(payloadContent, 'utf8'),
        });
        await cloudStorageKit.send(uploadDirective);
    } catch (issue) {
        return manageOperationFailure(issue);
    }

    if (completionAddress) {
        try {
            const notificationResponse = await networkFetcher(completionAddress);
            if (!notificationResponse.ok) {
                console.warn(`Completion notification failed: ${notificationResponse.statusText} (${notificationResponse.status})`);
            }
        } catch (issue) {
            console.warn('Could not dispatch completion notification:', issue);
        }
    }
};

orchestrateDataTransfer();