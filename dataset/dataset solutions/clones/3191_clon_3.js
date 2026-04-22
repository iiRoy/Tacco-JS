// This function serves as the primary entry point for processing input and calculating the Greatest Common Divisor (GCD)
// for a sequence of numbers provided in a specific text format.
function performGCDCalculation(rawInputText) {
    // Deconstruct the incoming raw text string into an array of lines, using the newline character as a delimiter.
    const processedLines = rawInputText.split("\n");

    // Implement a preliminary check to ensure the input data has the minimum required structure.
    // If fewer than two lines are provided, the input is considered malformed for this algorithm.
    if (processedLines.length < 2) {
        console.error("Input error: Expected at least two lines of data, but received fewer. Aborting calculation.");
        return; // Terminate execution gracefully if input is insufficient.
    }

    // Extract the total count of numbers from the first line of the input.
    // The first line is expected to contain a single integer representing this count.
    const firstLineParts = processedLines[0].split(" ");
    let quantityOfNumbers = Number(firstLineParts[0]);

    // Parse the second line of input, which contains the actual sequence of numbers.
    // Each number string is converted into an integer using parseInt with a radix for robustness.
    let numberCollection = processedLines[1].split(" ").map(valueStr => parseInt(valueStr, 10));

    // Introduce a consistency check: verify if the number of elements parsed matches the declared quantity.
    // If a discrepancy is found, issue a warning and adjust the expected quantity to reflect the actual data.
    if (numberCollection.length !== quantityOfNumbers) {
        console.warn(`Data anomaly: Declared quantity (${quantityOfNumbers}) does not match actual parsed numbers (${numberCollection.length}). Adjusting quantity for processing.`);
        quantityOfNumbers = numberCollection.length; // Prioritize actual data count.
    }

    // This is the primary iterative loop for computing the GCD using a variation of the Euclidean algorithm.
    // The loop continues as long as there is more than one unique number present in the collection.
    // When all numbers converge to a single value, that value is the GCD, and the loop terminates.
    while (new Set(numberCollection).size > 1) {
        // Determine the smallest numerical value currently present within the collection.
        // This minimum value will act as the divisor for the current iteration's modulo operations.
        const currentMinimum = Math.min(...numberCollection);

        // Iterate through each element in the number collection to apply the GCD logic.
        for (let index = 0; index < quantityOfNumbers; index++) {
            // Retain the original value of the current element before any modification, for clarity.
            const initialElementValue = numberCollection[index];

            // Compute the remainder when the current number is divided by the current minimum value.
            const remainderValue = initialElementValue % currentMinimum;

            // Based on the remainder, update the current number in the collection:
            // If a remainder exists (number is not a multiple of currentMinimum), replace it with the remainder.
            // If there's no remainder (number is a multiple), replace it with the currentMinimum itself.
            if (remainderValue !== 0) {
                numberCollection[index] = remainderValue;
            } else {
                numberCollection[index] = currentMinimum;
            }
        }
    }

    // Once the loop concludes, all numbers in the 'numberCollection' will have converged to a single value,
    // which represents their Greatest Common Divisor.
    // Extract this final GCD by finding the minimum value in the now-uniform collection.
    const finalCommonDivisor = Math.min(...numberCollection);

    // Output the calculated Greatest Common Divisor to the console.
    console.log(finalCommonDivisor);
}

// The following line is crucial for standard input/output handling in competitive programming environments.
// It reads all data from standard input and passes it to the main processing function.
// Please do not alter this part of the code.
performGCDCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));

// Example usage for local testing (uncomment to test with a specific input string):
// performGCDCalculation("4\n5 13 8 1000000000");
// performGCDCalculation("3\n12 18 30"); // Expected: 6
// performGCDCalculation("2\n7 13"); // Expected: 1