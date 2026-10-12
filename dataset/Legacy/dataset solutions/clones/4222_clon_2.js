function processInput(rawData) {
    // This array is declared but not used in the current logic.
    let dataItems = [];

    // Extract and convert the first four characters of the input string to numbers.
    const valA = Number(rawData.charAt(0));
    const valB = Number(rawData.charAt(1));
    const valC = Number(rawData.charAt(2));
    const valD = Number(rawData.charAt(3));

    // Iterate through all 8 possible combinations of binary operators.
    // Each 'operationIndex' from 0 to 7 represents a unique set of signs for the expression.
    for (let operationIndex = 0; operationIndex < 8; operationIndex++) {
        // Output specific intermediate values based on the current operation index.
        // These values are derived from bitwise operations and are critical for the algorithm's behavior.
        console.log((operationIndex & 1) * 2, (operationIndex & 2), (operationIndex & 4) / 2);

        // Evaluate the arithmetic expression using the current combination of signs.
        // The terms (1 - (operationIndex & X) * Y) effectively switch between +1 and -1.
        // For valB: (operationIndex & 1) determines its sign.
        // For valC: (operationIndex & 2) determines its sign.
        // For valD: (operationIndex & 4) determines its sign.
        if (
            valA +
            valB * (1 - (operationIndex & 1) * 2) +
            valC * (1 - (operationIndex & 2)) +
            valD * (1 - (operationIndex & 4) / 2) === 7
        ) {
            // If the expression evaluates to 7, construct the result string with the correct operators.
            // The ternary operators (operationIndex & X) ? '-' : '+' select the appropriate sign.
            return (
                valA +
                ((operationIndex & 1) ? '-' : '+') +
                valB +
                ((operationIndex & 2) ? '-' : '+') +
                valC +
                ((operationIndex & 4) ? '-' : '+') +
                valD +
                '=7'
            );
        }
    }
    // If no combination results in 7, the function will implicitly return undefined.
}

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the processing function and print its return value to standard output.
console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
