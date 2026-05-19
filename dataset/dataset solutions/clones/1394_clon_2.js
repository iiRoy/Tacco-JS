process.stdin.on("data", function(inputBuffer) {
    // Convert the input buffer to a string, remove whitespace, and split by space.
    let partsArray = (inputBuffer + "").trim().split(" ");

    // Parse the first two parts as numbers.
    let firstOperand = +partsArray[0];
    let secondOperand = +partsArray[1];

    // Calculate integer division, remainder, and floating-point division with fixed precision.
    let integerQuotient = firstOperand / secondOperand | 0;
    let remainderValue = firstOperand % secondOperand;
    let preciseQuotient = +(firstOperand / secondOperand).toFixed(8);

    // Output the results to the console.
    console.log(integerQuotient, remainderValue, preciseQuotient);
}).resume(); // Ensure the input stream continues to flow.
