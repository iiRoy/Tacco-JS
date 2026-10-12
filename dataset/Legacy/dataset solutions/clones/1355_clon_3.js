function processInput(rawData) {
    const parseNumericArray = (inputString) => {
        // Split the input string by spaces
        const stringElements = inputString.split(" ");
        // Map each string element to a number
        // Using Number() is an equivalent alternative to parseInt() for this context
        // and handles potential leading/trailing whitespace on elements gracefully.
        return stringElements.map((elementStr) => Number(elementStr));
    };

    // Obtain the array of numeric values using the helper function
    const numericValues = parseNumericArray(rawData);

    // Extract the individual numbers for clarity and reusability
    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    // Calculate the product of the two numbers
    const productResult = firstOperand * secondOperand;

    // Calculate the sum of the two numbers
    const sumOfOperands = firstOperand + secondOperand;

    // Calculate the perimeter (sum multiplied by two)
    const perimeterResult = sumOfOperands * 2;

    // Construct the final output string using a template literal
    const finalOutputString = `${productResult} ${perimeterResult}`;

    // Print the constructed string to the console
    console.log(finalOutputString);
}

// Read the input from standard input and pass it to the processing function.
// Explicitly specifying 'utf8' encoding ensures the input is read as a string.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
