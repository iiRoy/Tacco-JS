function processData(sourceData) {
    // Divide the incoming data into separate lines
    const inputLines = sourceData.split('\n');

    // Extract the sequence of numbers from the second line, splitting by space
    let numberStrings = inputLines[1].split(' ');

    // Initialize a variable to accumulate the product
    let totalProduct = 1;

    // The first line specifies the count of numbers to consider for multiplication
    // Iterate through the specified number of elements
    for (let loopIndex = 0; loopIndex < inputLines[0]; loopIndex++) {
        // Multiply the current product by the numeric value at the current position
        totalProduct = totalProduct * numberStrings[loopIndex];
    }

    // Display the final computed product to the console
    console.log(totalProduct);
}

// Read the entire content from standard input and pass it to the data processing function
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
