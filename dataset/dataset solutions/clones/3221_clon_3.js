/**
 * Orchestrates the processing of raw input data to determine a specific numeric condition.
 * This function handles the parsing, manipulation, and evaluation of a sequence of numbers.
 * @param {string} rawInputText - The complete string input, typically sourced from standard input.
 */
function processInputData(rawInputText) {
    // Divide the entire input string into an array of lines.
    // This allows for individual line access and processing.
    const inputLines = rawInputText.split('\n');

    // Implement an initial validation check for the input structure.
    // The problem requires at least two lines of input to proceed meaningfully.
    if (inputLines.length < 2) {
        console.log("Input Error: Insufficient lines provided for analysis.");
        return; // Halt execution if the input format is inadequate.
    }

    // The first line of input often contains a metadata value (e.g., a count).
    // However, for the core logic of this particular problem, this value is not
    // directly utilized. Therefore, its parsing has been intentionally omitted
    // as a Type III deletion of a non-essential statement.
    // (Original code parsed 'N', but it remained unused).

    // Process the second line to extract the sequence of numeric elements.
    // Each space-separated string is trimmed and converted into an integer.
    // Non-numeric strings will result in 'NaN' values, which are handled by
    // JavaScript's standard comparison rules (e.g., 'NaN < X' evaluates to false).
    let numericDataElements = inputLines[1].split(' ').map(strElement => {
        return parseInt(strElement.trim(), 10);
    });

    // Introduce a guard clause for an empty sequence of numbers.
    // If no numbers are present, the condition for comparison cannot possibly be met.
    if (numericDataElements.length === 0) {
        console.log("No");
        return;
    }

    // Arrange the numeric elements in ascending order.
    // This sorting step is fundamental for efficiently identifying the largest value.
    numericDataElements.sort((firstVal, secondVal) => firstVal - secondVal);

    // Retrieve and remove the largest element from the now-sorted array.
    // The `pop()` method modifies the array in-place and returns the last (largest) item.
    const largestElement = numericDataElements.pop();

    // Compute the cumulative sum of all the remaining elements in the array.
    // If the array became empty after `pop()` (meaning it originally had only one element),
    // the `reduce()` method will correctly return the initial accumulator value of 0.
    const sumOfRemainingElements = numericDataElements.reduce((accumulator, currentNumber) => {
        return accumulator + currentNumber;
    }, 0);

    // Evaluate the central condition: Is the largest element strictly less than the sum of the others?
    // A dedicated boolean variable is employed to store the outcome of this comparison.
    const isConditionSatisfied = (largestElement < sumOfRemainingElements);

    // Present the final result based on the computed boolean flag.
    console.log(isConditionSatisfied ? "Yes" : "No");
}

// The program's execution entry point. It reads the entire content from
// standard input and passes it to the primary processing function.
// This setup is common in environments like Node.js for competitive programming.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));