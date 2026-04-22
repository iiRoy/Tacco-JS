// This module provides functionality to re-initialize the primary data store.

let databaseDriver = require('mongodb'); // Utilize the MongoDB client library for operations.

const connectionString = process.env.DB_CONNECTION_STRING || // Retrieve connection string from environment variables.
  process.env.MONGO_URL_PRIMARY ||
  'mongodb://localhost/my_application_db'; // Fallback to local development database.

let sampleRecords = [ // A collection of sample data entries for seeding the database.
	{
		graphicLink: "https://example.com/images/profile123.jpg", // URL to the user's profile picture.
		userAlias: "Alice Wonderland", // Display name of the user.
		profilePage: "https://social.net/profiles/aliceW", // Link to the user's social profile.
		contactInfo: "alice@example.org", // User's email address.
		websiteAddress: "https://acme-corp.com", // User's personal or company website.
		messageText: "Acme Corp is seeking lead developers", // The main content of the notification.
		entryState: "pending", // Current status of this record.
		creationTimestamp: 1678886400, // Unix timestamp when the record was created.
		verificationCode: "secret_A" // Unique key for validation purposes.
	},
	{
		graphicLink: "https://example.com/images/profile123.jpg",
		userAlias: "Alice Wonderland",
		profilePage: "https://social.net/profiles/aliceW",
		contactInfo: "alice@example.org",
		websiteAddress: "https://acme-corp.com",
		messageText: "Acme Corp is seeking junior engineers",
		entryState: "scheduled",
		creationTimestamp: 1678886401,
		verificationCode: "secret_B"
	},
	{
		graphicLink: "https://example.com/images/profile123.jpg",
		userAlias: "Alice Wonderland",
		profilePage: "https://social.net/profiles/aliceW",
		contactInfo: "alice@example.org",
		websiteAddress: "https://acme-corp.com",
		messageText: "Acme Corp is seeking senior engineers",
		entryState: "active",
		creationTimestamp: 1678886402,
		verificationCode: "secret_C"
	},
	{
		graphicLink: "https://example.com/images/profile123.jpg",
		userAlias: "Alice Wonderland",
		profilePage: "https://social.net/profiles/aliceW",
		contactInfo: "alice@example.org",
		websiteAddress: "https://acme-corp.com",
		messageText: "Acme Corp is seeking principal architects",
		entryState: "expired",
		creationTimestamp: 1678886403,
		verificationCode: "secret_D"
	}
];


databaseDriver.Db.connect(connectionString, function (errorObject, databaseInstance) {
		// Attempt to establish a connection to the specified MongoDB server.
	if (errorObject) {
		throw errorObject; // If connection fails, propagate the error immediately.
	}

		// Drop the existing 'notifications' collection to ensure a clean state.
	databaseInstance.dropCollection('notifications', function (opError, opResult) {
			// Access the target collection for data manipulation.
		let dataCollection = databaseInstance.collection('notifications');

			// Insert the predefined sample data into the collection.
		dataCollection.insert(sampleRecords, function (opError, opResult) {
	  		if (errorObject) {
				throw errorObject; // Handle potential errors during the insertion process.
			}
	  		databaseInstance.close(); // Close the database connection after successful operation.
	    });
	});
});