function processInput (inputString) {
    // Split the incoming string by spaces to get individual components
    let numericValues = inputString.split(" ");

    // Iterate through the first four elements and convert them to integers
    for (let idx = 0; idx < 4; idx++) {
        numericValues[idx] = parseInt(numericValues[idx], 10); // Explicitly use base 10
    }

    // Calculate the product of the first two numbers
    let firstProduct = numericValues[0] * numericValues[1];
    // Calculate the product of the next two numbers
    let secondProduct = numericValues[2] * numericValues[3];

    // Determine which product is greater and print it to the console
    console.log((firstProduct > secondProduct) ? firstProduct : secondProduct);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
