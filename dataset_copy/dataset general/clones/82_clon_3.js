// This module provides a robust data access layer for the application, leveraging an Object-Relational Mapper (ORM) system.

// 1. Core ORM system import.
// The 'mongoose' library is imported and aliased for better semantic clarity within this module.
const dataAccessLayer = require('mongoose');

// 2. Configuration constants and naming conventions.
// Renamed the default configuration file path to reflect its application-specific nature.
const DEFAULT_CONFIGURATION_FILE_PATH = './appDatabaseConfig';
// Standardized collection and model names for improved maintainability and readability.
const PRIMARY_COLLECTION_NAME = 'financial_transactions'; // The collection where transaction records are stored.
const ORM_MODEL_IDENTIFIER = 'FinancialTransaction';     // The programmatic name for the Mongoose model.

// 3. Dynamic retrieval of the database connection string.
// This dedicated function centralizes the logic for fetching the MongoDB connection URI,
// prioritizing environment variables over local configuration files for deployment flexibility.
const procureDatabaseUri = () => {
  // Attempt to retrieve the database URI from environment variables first.
  // This is a common practice for production deployments.
  const environmentUri = process.env.DB_SERVICE_ENDPOINT;
  if (environmentUri) {
    console.info('[DAL Setup] Acquired database connection string from environment settings.');
    return environmentUri;
  }

  // If the URI is not found in environment variables, attempt to load it from a local configuration file.
  // This is typically used for local development or specific deployment scenarios.
  try {
    // Using object destructuring to cleanly extract the required URI from the configuration file.
    const { DB_SERVICE_ENDPOINT: configFileUri } = require(DEFAULT_CONFIGURATION_FILE_PATH);
    if (configFileUri) {
      console.info(`[DAL Setup] Retrieved database connection string from local configuration file: ${DEFAULT_CONFIGURATION_FILE_PATH}`);
      return configFileUri;
    }
  } catch (configLoadingError) {
    // Log a warning if the configuration file cannot be found or parsed, but do not halt execution yet.
    console.warn(`[DAL Setup] Warning: Unable to load local database configuration from '${DEFAULT_CONFIGURATION_FILE_PATH}'. Error: ${configLoadingError.message}`);
  }

  // This guard clause is critical: if no URI is found through any means, an error is thrown,
  // preventing the application from attempting to connect to a non-existent database.
  console.error('[DAL Setup] Critical: No database connection string detected. Please configure DB_SERVICE_ENDPOINT.');
  throw new Error('Database connection URI is indispensable for application startup.');
};

// Variable to store the database URI, initialized by calling the procurement function.
let databaseEndpointUri;
try {
  databaseEndpointUri = procureDatabaseUri();
} catch (uriProcurementError) {
  // If URI procurement fails, log the error. The module will proceed to export,
  // but subsequent database operations will likely fail due to a null connection handle.
  console.error('[DAL Setup] Initialization failed due to missing database URI:', uriProcurementError.message);
  // In a robust application, one might consider calling `process.exit(1)` here if the DB is truly mandatory.
}

// 4. Encapsulated function for establishing the database connection.
// This asynchronous function provides a structured way to connect, allowing for detailed configuration options.
const establishDatabaseConnection = async (uri) => {
  if (!uri) {
    console.error('[DAL Connect] Connection attempt aborted: No valid URI provided.');
    return null; // Return null if the URI is missing, indicating a failed connection attempt.
  }
  try {
    // Adding comprehensive connection options for robustness, performance, and adherence to best practices.
    await dataAccessLayer.connect(uri, {
      useNewUrlParser: true,        // Required for the current MongoDB driver to parse connection strings.
      useUnifiedTopology: true,     // Required for the current MongoDB driver to use the new topology engine.
      serverSelectionTimeoutMS: 6000, // Custom timeout for server discovery (6 seconds).
      socketTimeoutMS: 45000,       // Custom timeout for socket operations (45 seconds).
      appName: 'ApplicationDataService', // Identifies the application in MongoDB logs for easier debugging.
      autoIndex: false              // Prevents automatic index creation in production environments for safety.
    });
    console.info('[DAL Connect] Successfully initiated connection process to the data store.');
    return dataAccessLayer.connection; // Returns the Mongoose connection object upon successful initiation.
  } catch (connectionFailure) {
    console.error('[DAL Connect] Encountered an error during initial database connection:', connectionFailure.message);
    // Re-throwing the error to propagate it upwards, allowing the calling context to handle it.
    throw connectionFailure;
  }
};

// 5. Asynchronously connect and set up event listeners for the database handle.
// An Immediately Invoked Async Function Expression (IIAFE) is used to manage the startup connection logic.
let activeDatabaseHandle = null; // Renamed from 'connection' to 'activeDatabaseHandle' for clarity.
(async () => {
  try {
    // Attempt to establish the database connection using the procured URI.
    activeDatabaseHandle = await establishDatabaseConnection(databaseEndpointUri);

    if (activeDatabaseHandle) {
      // Setup various event listeners to monitor the connection's lifecycle.
      // Error event listener with a rephrased message for better context.
      activeDatabaseHandle.on('error', (connectionIssue) => {
        console.error('[DAL Event] Critical database error detected:', connectionIssue.message);
        // More advanced error handling might involve health checks, alerting systems, or graceful degradation.
      });

      // The 'open' event listener indicates a successful connection. Its message is rephrased.
      activeDatabaseHandle.once('open', () => {
        console.log('[DAL Event] Data access layer is fully operational and connected to the backend.');
        // This log serves as the primary success indicator for the database connection.
      });

      // Listener for 'disconnected' events (Type III addition).
      // Warns if the connection is lost and suggests potential re-establishment.
      activeDatabaseHandle.on('disconnected', () => {
        console.warn('[DAL Event] Database connection lost. Attempting to re-establish...');
        // In a production setup, this could trigger automated reconnection logic.
      });

      // Listener for 'reconnected' events (Type III addition).
      // Confirms when a lost connection has been successfully restored.
      activeDatabaseHandle.on('reconnected', () => {
        console.info('[DAL Event] Database connection successfully restored.');
      });

      // Listener for 'close' events (Type III addition).
      // Indicates a graceful shutdown of the database connection.
      activeDatabaseHandle.on('close', () => {
        console.info('[DAL Event] Database connection has been gracefully closed.');
      });

    } else {
      console.error('[DAL Setup] Database handle is null after connection attempt. Further operations will likely fail.');
    }
  } catch (overallSetupError) {
    // A catch-all block for any unhandled errors during the asynchronous setup phase.
    console.error('[DAL Setup] An unhandled error occurred during database module initialization:', overallSetupError.message);
    activeDatabaseHandle = null; // Ensure the handle is explicitly null if connection failed.
  }
})();

// 6. Definition of the ORM model for financial transactions.
// The schema is now explicitly defined with specific fields and options,
// replacing the empty schema ({}) from the original code for better structure and validation.
const financialTransactionSchema = new dataAccessLayer.Schema({
  // A 'processedAt' field is added to track when a transaction was recorded.
  processedAt: {
    type: Date,
    default: Date.now,
    required: true // Added a 'required' validator as a Type III change for data integrity.
  },
  // An 'isActive' field is added to denote the status of the transaction.
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // Adding schema options for automatic timestamps and a custom version key.
  timestamps: { createdAt: 'creationTime', updatedAt: 'lastUpdateTime' }, // Custom field names for timestamps.
  versionKey: '_revision' // Renamed the default version key to '_revision'.
});

// The ORM model is created using the defined schema and the specified collection name.
const FinancialTransactionRecord = dataAccessLayer.model(
  ORM_MODEL_IDENTIFIER,
  financialTransactionSchema,
  PRIMARY_COLLECTION_NAME
);

// 7. Module exports: Providing external access to the ORM system, connection, and models.
// All exported properties have been renamed for Type II compliance, and new helpers added for Type III.
module.exports = {
  // Export the entire ORM system client for advanced use cases.
  ormClient: dataAccessLayer,
  // Export the active database connection handle. This might be null if connection failed.
  currentDbConnection: activeDatabaseHandle,
  // Export the specific model for financial transactions, allowing other modules to interact with it.
  TransactionEntity: FinancialTransactionRecord,
  // New helper function: checks the current connection status.
  // Mongoose `readyState` values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting.
  isConnectionLive: () => activeDatabaseHandle && activeDatabaseHandle.readyState === 1,
  // New helper function: allows external modules to explicitly trigger a connection if needed, or re-initiate.
  initiateDbConnection: establishDatabaseConnection,
  // New exported constant for the model identifier, useful for consistency across the application.
  EntityModelName: ORM_MODEL_IDENTIFIER
};