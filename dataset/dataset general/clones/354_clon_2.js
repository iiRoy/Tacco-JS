var cloudStorageService = require("awssum-amazon-s3");
var httpFetcher = require("request");

// Define essential operational parameters
var   sourceAddress = process.env.TARGET_URL;
var completionEndpoint = process.env.SUCCESS_URL;
var   storageContainer = process.env.S3_BUCKET;
var    storedItemKey = process.env.S3_OBJECT;

// Set up the cloud storage client instance
var storageClient = new cloudStorageService.S3({
	"authenticationId": process.env.AWS_ACCESS_KEY,
	"secretAuthToken" : process.env.AWS_SECRET_KEY,
	"dataRegion": cloudStorageService.US_EAST_1
});

// Initiate the data retrieval, storage, and notification sequence
httpFetcher(sourceAddress, function (retrievalError, serverResponse, fetchedContent) {
	if (retrievalError) {
		logAndTerminate(retrievalError);
	}

	storageClient.PutObject({
		ContainerIdentifier: storageContainer,
		ObjectIdentifier: storedItemKey,
		PayloadSize: Buffer.byteLength(fetchedContent),
		ItemBody: fetchedContent
	}, function (storageOperationError) {
		if (storageOperationError) {
			logAndTerminate(storageOperationError);
		}

		if (completionEndpoint) {
			httpFetcher(completionEndpoint);
		}
	});
});

// A standard procedure for handling and reporting errors
function logAndTerminate(encounteredError) {
	console.error("An unrecoverable issue has occurred:", encounteredError);
	throw encounteredError;
}