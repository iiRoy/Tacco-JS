function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get an array of lines.
    rawData = rawData.split('\n');

    // The first line of input contains the relevant data.
    let firstLineData = rawData[0];

    // Parse the components from the first line, separated by spaces.
    // Note: These are implicitly converted to numbers during arithmetic operations.
    const valA = firstLineData.split(' ')[0]; // First numerical component
    const valB = firstLineData.split(' ')[1]; // Second numerical component
    const valC = firstLineData.split(' ')[2]; // Third numerical component
    const valD = firstLineData.split(' ')[3]; // Fourth numerical component (unused in calculation)

    // Perform the core arithmetic operation.
    const calculatedValue = valB - valC - valA;

    // Evaluate a conditional statement based on the parsed values.
    if (valB < valC) {
        // If the second value is less than the third, output 0.
        console.log(0);
    } else {
        // Otherwise, output the result of the calculation.
        console.log(calculatedValue);
    }
}

// Read the input from standard input using Node.js file system module.
// The input is read synchronously and decoded as UTF-8.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
