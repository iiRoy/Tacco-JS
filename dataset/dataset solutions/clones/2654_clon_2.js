function processInput(rawData) { // Primary function to handle incoming data
    const tokens = rawData.split(' '); // Divide the raw input into distinct parts
    const valOne = Number.parseInt(tokens[0], 10); // Convert the first segment to an integer base 10
    const valTwo = Number.parseInt(tokens[1], 10); // Convert the second segment to an integer base 10

    let greatestValue = valOne + valTwo; // Start by assuming the sum is the largest
    
    if (greatestValue < valOne - valTwo) { // Compare with the difference
        greatestValue = valOne - valTwo; // Update if the difference is greater
    }
    
    if (greatestValue < valOne * valTwo) { // Compare with the product
        greatestValue = valOne * valTwo; // Update if the product is greater
    }
    
    console.log(greatestValue); // Output the ultimate maximum found
}

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8')); // Invoke the processing function with data from standard input