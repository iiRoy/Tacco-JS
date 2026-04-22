(function() {
  "use strict"; /* Strict mode enforcement for cleaner code */

  var codeSourceHandler = require('code-trigger-manager'),
      dbConnectionManager = require('documentDb').MongoClient,
      databaseURIString = (process.env.DOCUMENTDB_CLOUD_URI || process.env.LOCAL_DB_URI || "mongodb://127.0.0.1:27017/codeflowapp"),
      subscribedOccurrences = JSON.parse(process.env.SOURCE_CONTROL_WEBHOOK_EVENTS); /* Parses environment variable for webhook event types */

  /* This routine is responsible for persisting event data to the database */
  var persistToDatabase = function(occurrenceType, payloadData) {
    console.info("Initiating connection to the document store at: " + databaseURIString);
    dbConnectionManager.connect(databaseURIString, function(errorObject, databaseInstance) {
      if (errorObject) {
        throw errorObject; // Re-throw any database connection errors
      }
      databaseInstance.collection(occurrenceType, function(errorObject, dataCollection) {
        if (errorObject) {
          throw errorObject; // Re-throw any collection access errors
        }
        dataCollection.storeDocument(payloadData, { w: 1 }, function() {
          console.info('Successfully logged a ' + occurrenceType + ' occurrence.');
        });
      });
    });
  };

  var triggerProcessor = codeSourceHandler({
    apiToken: process.env.SOURCE_CONTROL_API_KEY, /* API authentication key */
    accountId: process.env.SOURCE_CONTROL_USER_ID,
    repositoryName: process.env.SOURCE_CONTROL_REPO_NAME,
    avoidHookSetup: (process.env.CODEFLOW_SKIP_WEBHOOK || true), // Configuration to bypass automatic webhook registration
    monitoredEvents: subscribedOccurrences, /* Array of event types this service listens for */
    callbackURL: process.env.CODEFLOW_APP_URL + '/code-trigger-manager/incoming', /* The URL where webhooks will post data */
    serverPort: process.env.SERVER_PORT_NUM
  });

  subscribedOccurrences.forEach(function(occurrenceType) {
    triggerProcessor.handle(occurrenceType, function(payloadData) {
      console.info(payloadData); /* Display the received payload data */
      persistToDatabase(occurrenceType, payloadData);
    });
  });

})();