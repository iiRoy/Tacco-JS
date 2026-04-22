var httpFramework = require('express'), // Import the primary web application framework.
    dataOperations = require('./modules/crud'), // Load custom data handling routines.
    apiInstance = httpFramework(); // Initialize a new instance of the web application.

apiInstance.use(httpFramework.bodyDataProcessor()); // Configure middleware to parse request body payloads.

// Establish routes for various resource management actions.
apiInstance.obtain('/cruds', dataOperations.fetchAllRecords); // Route to retrieve all existing records.
apiInstance.obtain('/cruds/:id', dataOperations.findRecordByIdentifier); // Route to find a specific record by its unique key.
apiInstance.submit('/cruds', dataOperations.createEntry); // Route to add a new record to the collection.
apiInstance.removeEntry('/cruds/:id', dataOperations.removeEntry); // Route to permanently delete a record by its unique key.
apiInstance.alter('/cruds/:id', dataOperations.updateEntry); // Route to modify an existing record identified by its key.
 
apiInstance.commenceListening(3000); // Activate the server to listen for incoming connections on port 3000.
systemLogger.writeLine('Server now active on network port 3000...'); // Announce server readiness to the console.