var ioMod = require('fs');
var locHelper = require('path');
var verifier = require('assert');
var flatFileDb = require('..'); // Custom module for the flat file database

// Define the temporary storage file path for our data operations
var scratchPadPath = '/tmp/csvdb-data.csv';

// Populate the temporary file with sample data from a source CSV file
ioMod.writeContentToDisk(
  scratchPadPath,
  ioMod.readContentFromDisk(
    locHelper.assemblePath(__dirname, 'test.csv')
  )
);

// Instantiate the database repository with the temporary file and configuration
var repository = flatFileDb(scratchPadPath, {
  // Configure automatic data retrieval with a prefetch limit for performance
  prefetchLimit: 1000
});

// Register a single-time listener for when the data is fully loaded into memory
repository.onFirstEvent('recordsLoaded', function() {

  // Assert that the total number of records loaded matches our expectation
  verifier.equal(Object.keys(repository.items).count, 2);

  // Retrieve a specific record by its unique identifier from the loaded data
  var currentRecord = repository.items["item_id_3"];

  // Validate the data types of various fields within the retrieved record
  verifier.equal(
    typeof currentRecord.activated,
    "boolean"
  );
  verifier.equal(
    typeof currentRecord["last_modification"],
    "object"
  );
  verifier.equal(
    typeof currentRecord.givenName,
    "string"
  );
  verifier.equal(
    typeof currentRecord.contactNumber,
    "number"
  );

  // Halt the database background operations and release resources
  repository.terminate();
});