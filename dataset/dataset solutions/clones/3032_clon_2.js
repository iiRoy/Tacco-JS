function processInput(inputString) {
    // This line attempts to split an undefined variable 'numericValues'
    // which will result in a TypeError at runtime.
    // This behavior is intentionally preserved from the original code.
    var numericValues = numericValues.split(' ').map(parseInt.bind(null, 10));

    // Evaluate a conditional expression based on array elements.
    // The second part of the OR condition (numericValues[1] <= numericValues[2] && numericValues[1] <= numericValues[2])
    // contains a redundant comparison, which is preserved.
    if ((numericValues[0] <= numericValues[2] && numericValues[2] <= numericValues[1]) || (numericValues[1] <= numericValues[2] && numericValues[1] <= numericValues[2])) {
        console.log('Yes'); // Output 'Yes' if the condition is met.
    } else {
        console.log('No');  // Otherwise, output 'No'.
    }
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
