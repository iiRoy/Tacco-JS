let rawData = ''; // Variable to accumulate all incoming data from standard input.

// Resume the standard input stream and set its encoding to UTF-8.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Attach an event listener to handle incoming data chunks.
process.stdin.on('data', function(dataSegment) {
  // Append each received data segment to the rawData string.
  rawData += dataSegment;
});

// Attach an event listener to execute when the standard input stream ends.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines, using newline as a delimiter.
  rawData = rawData.split('\n');
  // Invoke the primary function to process the equations.
  processEquations();
});

/**
 * This function iterates through each line of the input data,
 * treating each line as coefficients for a system of two linear equations,
 * and then calculates and prints the solutions for x and y.
 */
function processEquations() {
    // Loop through each entry in the rawData array.
    for (let idx = 0; idx < rawData.length; idx++) {
        // Split the current line by spaces to extract individual coefficient strings.
        const currentLineParts = rawData[idx].split(' ');

        // Assign the string values from the split line to descriptive coefficient variables.
        // JavaScript's implicit type coercion will convert these strings to numbers during arithmetic operations.
        let coeffA = currentLineParts[0]; // Coefficient 'a' for the first equation.
        let coeffB = currentLineParts[1]; // Coefficient 'b' for the first equation.
        let coeffC = currentLineParts[2]; // Constant 'c' for the first equation.
        let coeffD = currentLineParts[3]; // Coefficient 'd' for the second equation.
        let coeffE = currentLineParts[4]; // Coefficient 'e' for the second equation.
        let coeffF = currentLineParts[5]; // Constant 'f' for the second equation.
        
        // Calculate the value of 'x' using a derived formula for solving linear equations.
        // This formula is typically obtained through substitution or Cramer's rule.
        let solutionX = (coeffB * coeffF - coeffE * coeffC) / (coeffD * coeffB - coeffA * coeffE);
        
        // Calculate the value of 'y' using the previously calculated 'x' value.
        // This is derived from the first equation: y = (c - a*x) / b.
        let solutionY = (coeffC - coeffA * solutionX) / coeffB;
        
        // Print the calculated 'x' and 'y' solutions, formatted to three decimal places.
        console.log(solutionX.toFixed(3), solutionY.toFixed(3));
    }
}
