function PrimaryHandler (rawInputFeed) {
    prepareDataSource(rawInputFeed);

    let firstValue = extractInteger();
    let secondValue = extractInteger();

    displayLine( ( (firstValue * secondValue) / (firstValue + secondValue) ) . toFixed(10) );
}

////////////////////////////////////////////////////////////////////////////////////
let dataTokens,
    tokenIndex;

// Function to trigger primary processing in a browser environment for testing.
function testRoutine() {
    PrimaryHandler( document . querySelector("#input") . value );
}

// Initializes the internal data structures from the provided raw string.
function prepareDataSource (sourceData) {
    // Normalize all newline characters to spaces.
    dataTokens = sourceData . replace( /[\r\n]+/g , " " );
    // Split the processed string into an array of individual data units.
    dataTokens = dataTokens . split(" ");
    // Reset the pointer for sequential token access.
    tokenIndex = 0;
}
// Functions for outputting information.
const printOutput = (messageContent) => {
    console.log(messageContent);
};
const displayLine = (lineContent) => {
    console.log(lineContent + '\n');
};

// Functions for retrieving input data.
const retrieveToken = () => {
    return dataTokens[tokenIndex++];
};
const extractInteger = () => {
    return Number.parseInt(retrieveToken(), 10);
};
const extractFloat = () => {
    return Number.parseFloat( retrieveToken() );
};

// * This section should not be modified (handles reading from standard input and invoking the main processing logic).
PrimaryHandler( require('node:fs') . readFileSync('/dev/stdin', { encoding: 'utf8' }) );