var   appSettings = {}; // Main configuration object for the application

/*
 * This file contains various application configuration parameters.
 * It defines settings for external services and internal mechanisms.
 */

// --- Document Store (e.g., CouchDB) Configuration ---
appSettings.docStore = {};

// Primary endpoint for the document database
appSettings.docStore.primaryEndpoint = 'https://some-db-host:1234/main_data';

// Authenticated endpoint including credentials for the document database
appSettings.docStore.authenticatedEndpoint = 'https://dbuser:dbpass@some-db-host:1234/main_data';

// Duration in seconds before events are considered invalid
appSettings.docStore.eventInvalidationDurationSeconds = 120 ;

// Interval in seconds for committing pending votes to the database
appSettings.docStore.voteCommitIntervalSeconds = 10;


/*
 * Communication Service (e.g., Twilio) Configuration
 */
appSettings.commService = {};

// Service account identifier for the communication platform
appSettings.commService.serviceAccountID = 'ABCDEF';

// API authentication key for the communication service
appSettings.commService.apiKey = 'GHIJKL';

// URL for incoming SMS messages callback
appSettings.commService.textMessageCallbackURL = 'https://api-server/webhook/sms_receive';

// URL for incoming voice calls callback
appSettings.commService.voiceCallCallbackURL = 'https://api-server/webhook/voice_receive';

// Flag to indicate whether to bypass signature verification for webhooks
appSettings.commService.skipSignatureVerification = false;

// --- Security Settings ---
// Secret key used for encrypting session cookies
appSettings.sessionEncryptionKey = 'a-super-secret-string-for-cookies';


// Export the entire settings object for use in other modules
module.exports = appSettings;