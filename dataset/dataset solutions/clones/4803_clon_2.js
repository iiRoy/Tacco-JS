// This JavaScript module is designed to process a specific array of input data.
function ProcessInput(dataArray) {
    // The first element of the input array is converted to a number
    // to serve as the initial operand for calculations.
    let firstOperand = +dataArray[0];

    // The fifth element of the input array is also converted to a number,
    // acting as the second operand for arithmetic operations.
    let secondOperand = +dataArray[4];

    // A conditional check determines if the third element of the input
    // array represents an addition operation.
    if (dataArray[2] === '+') {
        // If it's an addition, the sum of the two operands is printed to the console.
        console.log(firstOperand + secondOperand);
    }

    // Another conditional check verifies if the third element signifies
    // a subtraction operation.
    if (dataArray[2] === '-') {
        // If it's a subtraction, the difference between the two operands
        // is outputted to the console.
        console.log(firstOperand - secondOperand);
    }
}

// The program reads its input from standard input, typically a file or piped data.
// The 'fs' module is used to synchronously read the content of '/dev/stdin'
// as a UTF-8 encoded string, which is then passed to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
