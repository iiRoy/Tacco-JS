const processInput = (rawData) => {
    // Deconstruct the incoming text data into separate lines.
    const inputLines = rawData.split('\n');

    // Parse the total character count from the first line of input.
    const charCount = parseInt(inputLines[0]);

    // Retrieve the string that needs to be analyzed from the second line.
    const targetString = inputLines[1];

    // Obtain the zero-based index for the specific character from the third line.
    const charIndex = parseInt(inputLines[2]);
 
    // Extract the designated character that will serve as the comparison target.
    const specialChar = targetString[charIndex];
 
    // Initialize a dynamic array to store the characters after transformation.
    const transformedChars = [];

    // Iterate over each character in the target string from beginning to end.
    for (let currentIndex = 0; currentIndex < charCount; ++currentIndex) {
        // If the character at the current position does not match our special character...
        if (targetString[currentIndex] !== specialChar) {
            // ...then append an asterisk to the result array.
            transformedChars.push('*');
        }
        // Otherwise, if the characters are identical...
        else {
            // ...append the original character itself to the result array.
            transformedChars.push(targetString[currentIndex]);
        } 
    }

    // Combine all characters in the result array into a single string and output it.
    console.log(transformedChars.join(''));
};

// Initiate the processing by reading the content from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));