const dataLines = require('fs') .readFileSync('/dev/stdin', 'utf8') .split('\n'); // Read all input lines from standard input as an array of strings

let outputBuffer = ''; // Initialize an empty string buffer to hold the final generated output

for (let lineIndex = 0; lineIndex < dataLines.length; ++lineIndex) { // Iterate through each received line of input data
    // Parse the current line, splitting by space and converting parts to numbers
    const currentDimensions = dataLines[lineIndex] .split(' ') .map( val => +val ); 

    const heightVal = currentDimensions[0]; // Extract the height value from the parsed numbers
    const widthVal = currentDimensions[1]; // Extract the width value from the parsed numbers

    // Check for the termination condition: if both dimensions are zero
    if (widthVal === 0 && heightVal === 0) { 
        break; // Exit the loop as per problem specification
    }

    // Add a newline separator before appending a new rectangle, unless it's the very first one
    if (lineIndex !== 0) {
        outputBuffer += '\n'; 
    }

    // Generate the top/bottom solid row of '#' characters
    let topBottomRow = Array(widthVal + 1) .join('#') + '\n'; 
    outputBuffer += topBottomRow; // Append the newly generated top row to our output buffer

    // Loop for generating the inner, hollow rows of the rectangle
    for (let innerRowIndex = 1; innerRowIndex < heightVal - 1; innerRowIndex++) {
        // Construct an inner row: '#' + (width-1) '.' + '#' + newline
        outputBuffer += '#' + Array(widthVal - 1) .join('.') + '#' + '\n'; 
    }
    
    outputBuffer += topBottomRow; // Append the bottom row (which is identical to the top row)
}

console.log(outputBuffer); // Finally, print the accumulated string buffer to the standard output