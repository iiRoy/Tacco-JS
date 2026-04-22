// This file manages the primary database connection and model definitions.
var dataBaseConnector  =  require('mongoose');  // Load the database management library.

// Determine the connection string for the data store.
// It can come from environment variables or a local configuration file.
var   dbConnectString  =  process.env.DB_LINK_VAR  ||  require('./systemConfig').DB_LINK_PROP;

// Initiate the connection to the data storage system.
dataBaseConnector.connect(dbConnectString);

// Obtain a handle to the active database link.
var dbConnectionHandle = dataBaseConnector.connection;

// Define a data model for market transactions.
var FinancialExchange = dataBaseConnector.model(
  'TransactionRecord',     // Internal name for the data model.
  new dataBaseConnector.Schema({}), // An empty schema for now, can be extended later.
  'transaction_records'  // The actual collection name in the database.
);


// Register an event listener for connection errors.
dbConnectionHandle.on('error',
  function(issue) { // Callback function invoked when an error occurs.
    console.error('Database link experienced an issue:', issue); // Log the problem.
  }
); // End of error handler.


// Register a one-time event listener for a successful connection.
dbConnectionHandle.once(
  'open', // Event indicating the connection is ready.
  function() { // Callback function for successful connection.
    console.log('Data store link established successfully'); // Confirm connection.
  }
); // End of open handler.


// Export key components for other modules to utilize.
module.exports = {
  connectorInstance: dataBaseConnector,  // The Mongoose instance itself.
  activeLink: dbConnectionHandle,      // The active connection object.
  transactionModel: FinancialExchange   // The defined transaction model.
};