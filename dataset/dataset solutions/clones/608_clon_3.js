const fileSystemHandler = require('fs');

// Define the path for standard input, typically used in competitive programming environments.
const standardInputPath = '/dev/stdin';

// Acquire the raw textual data from the specified input stream.
// It's crucial to specify 'utf8' encoding to correctly interpret character data.
const rawInputData = fileSystemHandler.readFileSync(standardInputPath, 'utf8');

// A variable to store the cleaned and processed version of the input string.
let cleanedInputString;

// Implement a custom string trimming logic. This serves as an alternative to the
// built-in String.prototype.trim() method, demonstrating a rewritten equivalent.
// It removes leading and trailing whitespace characters, including common non-breaking spaces
// and byte order marks (BOMs) which might appear at the start of files.
if (rawInputData && typeof rawInputData === 'string') {
    cleanedInputString = rawInputData.replace(/^[\s\ufeff\xA0]+|[\s\ufeff\xA0]+$/g, '');
} else {
    // If input data is not a valid string or is empty, initialize to an empty string
    // to prevent errors in subsequent operations.
    cleanedInputString = '';
}

// Initialize an array to accumulate the lengths of 'O' sequences that satisfy our criteria.
// We seed it with 0 to ensure that if no valid sequences are found, the maximum will correctly default to 0.
const qualifyingOCounts = [0];

// Define the regular expression pattern to identify sequences of 'J', 'O', and 'I' characters.
// The 'g' flag is essential for finding all occurrences, not just the first.
// Each group (J*), (O*), (I*) captures zero or more of the respective character.
const joiSequencePattern = /(J*)(O*)(I*)/g;

// Proceed with pattern matching only if there is meaningful content after cleaning.
if (cleanedInputString.length > 0) {
    // Use String.prototype.matchAll() to get an iterator over all matches.
    // This is a modern and flexible way to handle multiple regex matches.
    for (const currentMatchSegment of cleanedInputString.matchAll(joiSequencePattern)) {
        // Extract the individual captured groups from the current match object.
        // currentMatchSegment[1] contains the 'J' sequence.
        // currentMatchSegment[2] contains the 'O' sequence.
        // currentMatchSegment[3] contains the 'I' sequence.
        const capturedJays = currentMatchSegment[1];
        const capturedOhs = currentMatchSegment[2];
        const capturedEyes = currentMatchSegment[3];

        // Determine the length (count) of each captured character sequence.
        // Use a ternary operator to safely get length, defaulting to 0 if the capture group was empty.
        const countOfJays = capturedJays ? capturedJays.length : 0;
        const countOfOhs = capturedOhs ? capturedOhs.length : 0;
        const countOfEyes = capturedEyes ? capturedEyes.length : 0;

        // Establish the primary condition for a valid 'JOI' sequence.
        // The number of 'J's must be greater than or equal to the number of 'O's.
        // AND the number of 'I's must also be greater than or equal to the number of 'O's.
        const meetsLengthCriteria = (countOfJays >= countOfOhs) && (countOfEyes >= countOfOhs);

        // If the current sequence of 'J', 'O', 'I' meets the defined criteria,
        // add the count of 'O's to our collection.
        if (meetsLengthCriteria) {
            qualifyingOCounts.push(countOfOhs);
        }
    }
} else {
    // In scenarios where the input is entirely empty or just whitespace,
    // this branch indicates that no analysis was performed.
    // The 'qualifyingOCounts' array will still contain [0], ensuring a valid Math.max result.
    // console.info("No substantial input detected after trimming; no JOI sequences to evaluate.");
}

// Compute the largest value among all the 'O' counts that met the specified conditions.
// The spread syntax (...) efficiently passes all elements of the array as arguments to Math.max().
const finalMaximumOValue = Math.max(...qualifyingOCounts);

// Display the ultimate result to the standard output.
console.log(finalMaximumOValue);