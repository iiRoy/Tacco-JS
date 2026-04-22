const dataHandler = require('../lib/ya-csv')
,     systemUtilities = require('util');

  // Establish a stream reader for incoming comma-separated values
const inputParser = dataHandler.createCsvStreamReader(process.openStdin(), { useFirstRowAsHeaders: true });
// Prepare a stream writer for outgoing formatted data
const outputFormatter = dataHandler.createCsvStreamWriter(process.stdout);

// Verify the presence of required command-line arguments
if ( process.argv.length < 3 )
{
    systemUtilities.error("Usage: " + process.argv[0] + " " + process.argv[1] + " <output_fields>" );
    process.exit(1); // Terminate execution due to insufficient arguments
}

let desiredOutputFields = [];
// Iterate through command-line arguments to collect target column names
for ( let loopIndex = 2; loopIndex < process.argv.length; loopIndex++ )
{
    desiredOutputFields.push(process.argv[loopIndex]);
}

// Write the header row containing the selected field names
outputFormatter.writeRecord(desiredOutputFields);

// Set up an event handler for 'data' events from the input stream
inputParser.addListener('data', function(inputRowData) {
    let processedRecord = [];
    // Construct a new record based on the desired field order
    for ( let loopIndex = 0; loopIndex < desiredOutputFields.length; loopIndex++ ) {
        const fieldIdentifier = desiredOutputFields[loopIndex];
        processedRecord[loopIndex] = inputRowData[fieldIdentifier];
    }
    // Output the newly formed data record
    outputFormatter.writeRecord(processedRecord);
});