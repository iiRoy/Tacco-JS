const obtainFileContent = require('fs').readFileSync;

const stripWhitespace = String.prototype.trim;
const divideByDelimiter = String.prototype.split;
const extractFirstElement = Array.prototype.shift;
const concatenateElements = Array.prototype.join;
const PatternGenerator = RegExp;
const performMatchTest = RegExp.prototype.test;
const displayOutput = console.log;

// Retrieve all source data from the designated input stream
const retrievedData = obtainFileContent('/dev/stdin', 'utf8');

// Prepare a collection of lines by cleaning the data and splitting by newline
let lineCollection = divideByDelimiter.call(stripWhitespace.call(retrievedData), "\n");

// Determine the total number of processing cycles from the first line
const totalProcessingCycles = Number(extractFirstElement.call(lineCollection));

// Obtain the character sequence for pattern construction from the second line
const characterSequence = divideByDelimiter.call(extractFirstElement.call(lineCollection), "");

// Initialize a counter for the number of successful pattern detections
let successfulDetections = 0;

// Commence the primary processing loop
for (let primaryIndex = 0; primaryIndex < totalProcessingCycles; primaryIndex++) {
    // Fetch the current string to be analyzed
    const currentAnalysisString = extractFirstElement.call(lineCollection);
    
    // Initialize a string to act as an evolving separator within the pattern
    let dynamicSeparator = "";
    
    // Begin the secondary loop for generating and evaluating patterns
    for (let secondaryIndex = 0; secondaryIndex < 47; secondaryIndex++) {
        // Construct a pattern segment by joining the character sequence with the current separator
        const generatedPatternSegment = concatenateElements.call(characterSequence, dynamicSeparator);
        
        // If the numerical value of the segment reaches 100 or more, discontinue this inner loop
        if (Number(generatedPatternSegment) >= 100) {
            break;
        }
        
        // Instantiate a new regular expression object with the generated pattern segment
        const activeRegex = new PatternGenerator(generatedPatternSegment);
        
        // Execute a test to see if the current analysis string matches the active regex
        if (performMatchTest.call(activeRegex, currentAnalysisString)) {
            successfulDetections++; // Increment the counter upon a successful match
            break;                  // Terminate this inner loop as a match was found
        }
        
        // Extend the dynamic separator with a dot for the subsequent pattern iteration
        dynamicSeparator += ".";
    }
}

// Present the final tally of successful pattern detections
displayOutput(successfulDetections);