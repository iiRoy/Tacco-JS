const ORM = require('mongoose');

// Function to retrieve the database link string from environment or local configuration
const acquireDataStorePath = () => {
  const environmentKey = 'DB_LINK_STR';
  const localConfigurationModule = './databaseSettings';
  const configurationProperty = 'CONNECTION_STRING';

  const environmentSetting = process.env[environmentKey];
  if (environmentSetting) {
    return environmentSetting;
  }

  // Fallback to local configuration, mirroring original's direct require behavior
  const localConfiguration = require(localConfigurationModule);
  return localConfiguration[configurationProperty];
};

// Establish the connection to the data store
const commenceDataLink = (path) => {
  if (!path) {
    console.error('Fatal: No data store connection path provided.');
    // Mongoose connect with undefined path would typically throw an error,
    // so this explicit check is fine. Original would let mongoose handle it.
    return;
  }
  ORM.connect(path);
};

const activeDataLink = ORM.connection; // Reference to the active Mongoose connection

// Define a foundational schema blueprint
const defaultSchemaDefinition = new ORM.Schema({});

// Create a data model with distinct naming
const RecordEntity = ORM.model('RecordEntity', defaultSchemaDefinition, 'entity_records');

// Register a listener for connection errors
activeDataLink.on('connectionFailure', (malfunction) => {
  console.error('Data layer connection issue:', malfunction.message || malfunction);
});

// Register a one-time listener for successful connection
activeDataLink.once('linkEstablished', () => {
  console.info('Data layer link successfully established.');
});

// Execute the connection process
commenceDataLink(acquireDataStorePath());

// Export the key components with new identifiers
module.exports = {
  ormFramework: ORM,
  activeDatabaseLink: activeDataLink,
  entityModel: RecordEntity
};