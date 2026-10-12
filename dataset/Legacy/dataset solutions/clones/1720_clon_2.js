// This function processes the given raw data to compute a specific value.
function ProcessInput(rawData) {
    // Split the incoming data into individual lines and reassign the parameter.
    // This maintains the original's behavior of modifying the function argument.
    rawData = rawData.split('\n');

    // Extract the first line from the modified 'rawData' array, convert it to an integer (base 10).
    // This will be our primary numerical component.
    const baseValue = parseInt(rawData[0], 10);

    // Calculate the sum of the base value, its square, and its cube.
    // The variable 'finalOutcome' is intentionally not declared with 'let' or 'const'
    // to mimic the original's implicit global scope for 'result'.
    finalOutcome = baseValue + (baseValue * baseValue) + (baseValue * baseValue * baseValue);

    // Output the computed final outcome to the standard console.
    console.log(finalOutcome);
}

// Read the content from standard input synchronously and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
