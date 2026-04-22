const fileSystemUtility = require('fs');
const readInputFileContent = fileSystemUtility.readFileSync;
const trimStringBoundaries = (textToClean) => textToClean.trim();

const numericalParser = parseInt; // Helper for converting text to numbers

const outputDisplay = console.log; // Helper for sending messages to the console

// --- Program Start ---

// Retrieve raw data from the standard input stream, ensuring no leading/trailing spaces.
const rawTextualData = trimStringBoundaries(readInputFileContent('/dev/stdin', 'utf8'));
// For local testing, one might uncomment: // const exampleInputString = "14";

// Convert the obtained textual data into its numerical representation.
let currentWorkingNumber = numericalParser(rawTextualData);
const initialNumericValue = currentWorkingNumber; // Store the original value for later output.

// Initialize a dynamic array to hold the prime factors found.
const discoveredFactors = [];

// Create an alias for adding elements to our factor collection.
const addElementToCollection = discoveredFactors.push.bind(discoveredFactors);

// Iterate through potential divisors, starting from 2.
for (let divisorCandidate = 2; divisorCandidate <= currentWorkingNumber; divisorCandidate++) {
  // Continuously divide by the current candidate if it's a factor.
  while (currentWorkingNumber % divisorCandidate === 0) {
    addElementToCollection(divisorCandidate); // Record this prime factor.
    currentWorkingNumber /= divisorCandidate; // Reduce the number for further factorization.
  }
}

// Create an alias for joining array elements into a string.
const concatenateElements = discoveredFactors.join.bind(discoveredFactors);

// Output the original number followed by its prime factors, separated by spaces.
outputDisplay(initialNumericValue + ': ' + concatenateElements(' '));