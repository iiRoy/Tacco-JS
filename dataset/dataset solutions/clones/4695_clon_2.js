process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputVal; // This variable will hold the integer value from standard input.
const modulusVal = 1000000007; // A constant for the modulo operation.

// Attach an event handler for when data is received from standard input.
process.stdin.on('data', function (receivedData) {
    // Process each line of the received data.
    receivedData.trim().split('\n').forEach(function(currentLine) {
        // Convert the line string to an integer and store it.
        inputVal = parseInt(currentLine);
    });
});

// Attach an event handler for when the end of standard input is reached.
process.stdin.on('end', function () {
    let finalProduct = 1; // Initialize a variable to calculate the factorial product.

    // Iterate from 1 up to the value stored in inputVal (inclusive).
    for (let loopIndex = 1; loopIndex <= inputVal; loopIndex++) {
        finalProduct *= loopIndex; // Multiply the current product by the loop index.
        finalProduct %= modulusVal; // Apply the modulo operation to the product.
    }

    // Display the final computed product to the console.
    console.log(finalProduct);
});
