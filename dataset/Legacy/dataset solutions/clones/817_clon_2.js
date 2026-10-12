process.stdin.resume();
process.stdin.setEncoding('utf8');

// Declare various program variables for processing input and results.
var unusedVariable = 0; // This variable is declared but not utilized in the core logic.

// Helper function to generate powers of ten.
// It takes a numeric value, truncates it to an integer, and returns 10 raised to that power.
var powerOfTenGenerator = function(exponentValue) {
    return Math.pow(10, ~~exponentValue);
};

var allInputLines; // Stores all lines received from standard input.
var currentCaseIterator; // Loop counter for iterating through test cases.
var foundResultPairs; // An array to hold valid number pairs for the current test case.
var currentInputNumbers; // An array containing the two input numbers for the current test case.
var firstCandidateNumber; // Represents the first number in a potential pair.
var secondCandidateNumber; // Represents the second number in a potential pair.

// Set up an event listener to handle incoming data from the standard input stream.
process.stdin.on('data', function(incomingRawData) {
    // Split the raw input string into an array of lines.
    allInputLines = incomingRawData.split('\n');
    // Convert the first line (which indicates the total number of test cases) to an integer.
    allInputLines[0] = ~~allInputLines[0];

    // Loop through each test case based on the count provided in the first input line.
    for (currentCaseIterator = 0; currentCaseIterator < allInputLines[0]; ++currentCaseIterator) {
        foundResultPairs = []; // Initialize an empty array to store results for the current case.
        // Split the current test case line into its constituent string numbers.
        currentInputNumbers = allInputLines[currentCaseIterator + 1].split(' ');

        // Outer loop: Iterate through possible values for the first number.
        // The range is determined by the first input number (currentInputNumbers[0]).
        for (firstCandidateNumber = powerOfTenGenerator(currentInputNumbers[0] - 1);
             firstCandidateNumber + 1 < powerOfTenGenerator(currentInputNumbers[0]);
             ++firstCandidateNumber) {

            // Inner loop: Iterate through possible values for the second number.
            // The range is determined by the second input number (currentInputNumbers[1]).
            for (secondCandidateNumber = powerOfTenGenerator(currentInputNumbers[1] - 1);
                 secondCandidateNumber + 1 < powerOfTenGenerator(currentInputNumbers[1]);
                 ++secondCandidateNumber) {

                // Check the specific mathematical condition:
                // Is the sum of an arithmetic progression from 'firstCandidateNumber' to 'secondCandidateNumber'
                // equal to the number formed by concatenating their string representations?
                if ((firstCandidateNumber + secondCandidateNumber) * (secondCandidateNumber - firstCandidateNumber + 1) / 2 === ('' + firstCandidateNumber + secondCandidateNumber)) {
                    // If the condition is met, add the pair (as a string) to the results array.
                    foundResultPairs.push(firstCandidateNumber + ' ' + secondCandidateNumber);
                }
            }
        }

        // After checking all pairs for the current test case, output the results.
        if (foundResultPairs.length > 0) {
            // If any valid pairs were found, print each one on a new line.
            foundResultPairs.map(function(pairOutputString) {
                console.log(pairOutputString);
            });
        } else {
            // If no valid pairs were found, print the specified message.
            console.log('No cats.');
        }
    }
});
