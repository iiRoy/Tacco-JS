// Fetch raw content from the standard input stream
const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');


// Clean and segment the raw data into an array of individual text entries
const processedRecords = sourceData.trim()
                                   .split('\n');

let currentRecord; // Designates the current line being processed within the loop

// Continuously iterate through each record (line) from the collection
// The loop terminates when no more records are available, or an empty string is encountered
while (currentRecord = processedRecords.shift()) {
    // Transform the current text record into a numerical body mass value
    const bodyMass = Number(currentRecord);

    let weightDivision; // Placeholder for the determined boxing weight category

    // Apply conditional logic to assign a specific weight division based on body mass
    if (bodyMass <= 48) {
        weightDivision = 'light flyweight';
    } else if (bodyMass <= 51) {
        weightDivision = 'flyweight';
    } else if (bodyMass <= 54) {
        weightDivision = 'bantamweight';
    } else if (bodyMass <= 57) {
        weightDivision = 'featherweight';
    } else if (bodyMass <= 60) {
        weightDivision = 'lightweight';
    } else if (bodyMass <= 64) {
        weightDivision = 'light welterweight';
    } else if (bodyMass <= 69) {
        weightDivision = 'welterweight';
    } else if (bodyMass <= 75) {
        weightDivision = 'light middleweight';
    } else if (bodyMass <= 81) {
        weightDivision = 'middleweight';
    } else if (bodyMass <= 91) {
        weightDivision = 'light heavyweight';
    } else {
        weightDivision = 'heavyweight';
    }

    // Display the computed weight division to the console's standard output
    console.log(weightDivision);
}