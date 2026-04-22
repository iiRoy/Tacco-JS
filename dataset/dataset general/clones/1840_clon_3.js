(function () {
  "use strict"; // Activate strict JavaScript mode for improved error handling and code quality.

  /**
   * Utility object to abstract and centralize access to environment variables,
   * providing default values and parsing capabilities.
   */
  const environmentSettings = {
    // Retrieves an environment variable, returning a default if not found.
    fetchVariable: (key, defaultValue = undefined) => process.env[key] || defaultValue,

    // Parses a JSON environment variable, handling errors and returning a default.
    parseJsonVariable: (key, defaultValue = []) => {
      const rawValue = process.env[key];
      if (rawValue) {
        try {
          return JSON.parse(rawValue);
        } catch (parsingErr) {
          console.error(`Configuration error: Failed to parse JSON for '${key}'. Using default.`, parsingErr);
          return defaultValue;
        }
      }
      return defaultValue;
    }
  };

  // Load essential modules for webhook processing and database operations.
  const webhookListenerModule = require('git-at-me');
  const databaseConnectionManager = require('mongodb').MongoClient;

  // Determine the MongoDB connection string, prioritizing various environment variables.
  const databaseServiceEndpoint = environmentSettings.fetchVariable('MONGOHQ_URL')
                                || environmentSettings.fetchVariable('MONGO_URL')
                                || "mongodb://127.0.0.1:27017/event_aggregator";

  // Obtain the list of GitHub event types to monitor, defaulting to an empty array.
  const subscribedEventCategories = environmentSettings.parseJsonVariable('GITHUB_HOOK_EVENTS', []);

  /**
   * Handles the storage of an incoming webhook event's data into the MongoDB database.
   * Each distinct event type is stored in its own collection.
   *
   * @param {string} categoryIdentifier - The string name of the event type (e.g., 'push', 'pull_request').
   * @param {object} eventDataPayload - The full JSON payload received from the webhook.
   * @returns {Promise<void>} - A promise that resolves when data is stored or rejects on failure.
   */
  const storeEventRecord = async function (categoryIdentifier, eventDataPayload) {
    // Validate the input to prevent unnecessary database operations or errors.
    if (!categoryIdentifier || typeof categoryIdentifier !== 'string' || !eventDataPayload) {
      console.warn("Data persistence skipped: Invalid event category identifier or payload received.");
      return;
    }

    console.debug(`Initiating database connection attempt to: ${databaseServiceEndpoint}`);

    let dbSession; // Declare dbSession outside the try block for finally access

    try {
      // Connect to the MongoDB instance using modern options.
      dbSession = await databaseConnectionManager.connect(databaseServiceEndpoint, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // Timeout after 5s if server not found
      });
      console.log("Successfully connected to the database.");

      // Select the collection corresponding to the event category.
      const targetCollection = dbSession.collection(categoryIdentifier);

      // Insert the event data as a single document.
      const insertionResult = await targetCollection.insertOne(eventDataPayload);

      console.info(`Event '${categoryIdentifier}' successfully logged with ID: ${insertionResult.insertedId}`);

    } catch (connectionOrInsertionError) {
      console.error(`Critical error during database operation for event '${categoryIdentifier}':`, connectionOrInsertionError);
      // Depending on the error, a more sophisticated retry or alert mechanism might be implemented here.
      throw connectionOrInsertionError; // Re-throw to propagate the error up the call stack.
    } finally {
      // Ensure the database connection is closed regardless of success or failure.
      if (dbSession) {
        await dbSession.close();
        console.debug("Database connection closed.");
      }
    }
  };

  // Configure the GitHub webhook receiver with parameters from environment variables.
  const gitEventReceiver = webhookListenerModule({
    accessCredential: environmentSettings.fetchVariable('GITHUB_TOKEN'),
    repositoryOwner: environmentSettings.fetchVariable('GITHUB_USERNAME'),
    repositoryName: environmentSettings.fetchVariable('GITHUB_REPOSITORY'),
    // Explicitly convert environment variable to boolean for clarity.
    skipWebhookSetup: (environmentSettings.fetchVariable('AYGABTU_SKIP_HOOK') === 'true'),
    monitoredEvents: subscribedEventCategories, // Array of events to listen for.
    notificationUrl: `${environmentSettings.fetchVariable('AYGABTU_URL')}/git-at-me/events`, // The endpoint GitHub will POST to.
    serverPort: parseInt(environmentSettings.fetchVariable('PORT', '3000'), 10), // Port for the webhook server.
    // An example of an added, non-essential configuration parameter.
    connectionTimeout: 10000 // Timeout for external API calls, in milliseconds.
  });

  // Verify that there are event types configured before attempting to set up listeners.
  if (subscribedEventCategories.length === 0) {
    console.warn("No GitHub event types are configured for monitoring. The webhook receiver will be inactive.");
    // Optionally, could exit or throw an error here if event types are mandatory.
  } else {
    console.info(`Configuring webhook listeners for the following categories: [${subscribedEventCategories.join(', ')}]`);

    // Iterate through each specified event type and register a corresponding handler.
    subscribedEventCategories.forEach(function (currentCategory) {
      // Attach a callback function to each monitored event.
      gitEventReceiver.on(currentCategory, async function (incomingEventPayload) {
        // Log the event type, but omit full payload in production for brevity/security.
        // console.debug(`Received event of type '${currentCategory}'.`); // Removed full payload log for Type III.

        try {
          // Attempt to store the received event data in the database.
          await storeEventRecord(currentCategory, incomingEventPayload);
        } catch (persistenceError) {
          console.error(`Failed to persist event '${currentCategory}' to database:`, persistenceError.message);
          // Further error handling, like notifying administrators, could go here.
        }
      });
    });
    console.log("GitHub webhook receiver successfully initialized and awaiting incoming events.");
  }

})();