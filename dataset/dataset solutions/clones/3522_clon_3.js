const processInputData = (inputRawString) => {
    // Validate the raw input string to ensure it's not empty or just whitespace.
    if (!inputRawString || inputRawString.trim().length === 0) {
        console.error("Error: The provided input data is empty or consists only of whitespace.");
        return; // Terminate execution if input is invalid.
    }

    // Divide the entire input string into an array of individual lines.
    const textLines = inputRawString.split('\n');

    // Check if any lines were successfully extracted from the input.
    if (textLines.length === 0) {
        console.error("Error: No distinct lines could be found in the input data.");
        return;
    }

    // Focus on the very first line of the input for our numeric values.
    // Split this line by space characters to get an array of string tokens.
    const firstLineTokens = textLines[0].split(' ');

    // Verify that there are at least three tokens available for numeric conversion.
    if (firstLineTokens.length < 3) {
        console.error("Error: Insufficient data on the first line. Expected at least three numeric tokens.");
        return;
    }

    // Convert the first three string tokens into numerical values.
    // Using the Number() constructor for parsing, which is robust for various number formats.
    const primaryNumericValue = Number(firstLineTokens[0]);
    const secondaryNumericValue = Number(firstLineTokens[1]);
    const tertiaryNumericValue = Number(firstLineTokens[2]);

    // Perform validation to ensure all parsed values are legitimate numbers (not NaN).
    if (isNaN(primaryNumericValue) || isNaN(secondaryNumericValue) || isNaN(tertiaryNumericValue)) {
        console.error("Error: One or more input tokens could not be accurately converted into valid numbers.");
        return;
    }

    // Consolidate the validated numeric values into a single array for streamlined processing.
    const collectionOfNumbers = [primaryNumericValue, secondaryNumericValue, tertiaryNumericValue];

    // Identify the highest value present within the collection of numbers.
    // The spread operator (...) efficiently passes array elements as arguments to Math.max.
    const highestObservedValue = Math.max(...collectionOfNumbers);

    // Initialize an accumulator variable to store the final computed sum.
    let finalCalculatedSum = 0;

    // Introduce a boolean flag to manage the special multiplication rule.
    // This ensures that only the *first* occurrence of the highest value is multiplied by ten,
    // especially relevant if there are duplicate highest values.
    let highestValueProcessed = false;

    // Iterate through each number in our collection.
    for (let currentNumber of collectionOfNumbers) {
        // Apply the special rule: if the current number is the highest value
        // and we haven't yet applied the multiplication rule to a highest value.
        if (currentNumber === highestObservedValue && !highestValueProcessed) {
            finalCalculatedSum += currentNumber * 10; // Multiply by ten and add.
            highestValueProcessed = true; // Set the flag to true, indicating special rule applied.
        } else {
            finalCalculatedSum += currentNumber; // Otherwise, simply add the number to the sum.
        }
    }

    // Display the final computed sum to the standard output.
    console.log(finalCalculatedSum);
};

// This specific part of the code is responsible for reading input from the standard input stream
// and should typically remain unaltered to ensure proper execution in competitive programming
// or similar environments. It then invokes our main processing function.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));