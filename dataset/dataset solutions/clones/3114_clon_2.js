// This function orchestrates the primary logic for processing an input stream.
function ProcessInputData(sourceData) {
    // Split the entire input string by newline characters into an array of lines.
    let dataLines = sourceData.split("\n");

    // Extract the first line, convert it to an integer, representing the total count of items.
    const totalItemCount = parseInt(dataLines[0], 10);

    // Initialize an array to store various components of the final generated output.
    let outputSegments = [];

    // Check if the total item count is an even number.
    if (totalItemCount % 2 === 0) {
        // For even counts, calculate and append a specific numerical value.
        outputSegments.push((totalItemCount - 2) * totalItemCount / 2);

        // Iterate through items to form pairs, starting from the first item.
        for (let currentOuterIndex = 1; currentOuterIndex < totalItemCount + 1; currentOuterIndex++) {
            // Nested loop to select a second item, ensuring it's distinct and after the first.
            for (let currentInnerIndex = currentOuterIndex + 1; currentInnerIndex < totalItemCount + 1; currentInnerIndex++) {
                // Apply a specific filtering condition for even item counts.
                if (currentInnerIndex !== totalItemCount + 1 - currentOuterIndex) {
                    // Concatenate the indices and add the resulting string to the output segments.
                    outputSegments.push(currentOuterIndex + " " + currentInnerIndex);
                }
            }
        }
    } else { // This block executes if the total item count is an odd number.
        // For odd counts, compute and append a different specific numerical value.
        outputSegments.push((totalItemCount - 3) * (totalItemCount - 1) / 2 + (totalItemCount - 1));

        // Iterate through items to form pairs, similar to the even case.
        for (let currentOuterIndex = 1; currentOuterIndex < totalItemCount + 1; currentOuterIndex++) {
            // Nested loop for selecting the second item.
            for (let currentInnerIndex = currentOuterIndex + 1; currentInnerIndex < totalItemCount + 1; currentInnerIndex++) {
                // Apply a distinct filtering condition for odd item counts.
                if (currentInnerIndex !== totalItemCount - currentOuterIndex) {
                    // Add the valid pair string to the output segments.
                    outputSegments.push(currentOuterIndex + " " + currentInnerIndex);
                }
            }
        }
    }

    // Join all collected output segments into a single string, using newline characters.
    const finalResultString = outputSegments.join("\n");

    // Output the completed result string to the standard console.
    console.log('%s', finalResultString);

    // Return the final string result.
    return finalResultString;
}

// A utility function for performing test validations within a web-based debugging environment.
function ExecuteTestValidation(testCaseIdentifier) {
    // Retrieve the input value from a specific HTML element using its ID.
    let testInputValue = document.getElementById("input" + testCaseIdentifier).value;

    // Invoke the main processing function with the obtained test input.
    let computedSolution = ProcessInputData(testInputValue);

    // Initialize the status of the test validation.
    let currentValidationStatus = "FAILURE";

    // Compare the computed solution with the expected output from another HTML element.
    if (computedSolution === document.getElementById("output" + testCaseIdentifier).value.split("\n")[0]) {
        // If the solutions match, update the status to indicate success.
        currentValidationStatus = "SUCCESS";
    }

    // Update the inner HTML content of the result display element with the validation status.
    document.getElementById("result" + testCaseIdentifier).innerHTML = currentValidationStatus;
}

// Execute the primary processing function by reading input from the standard input stream (e.g., in a Node.js environment).
ProcessInputData(require("nodeFileSystem").readTextFile("/dev/stdin", "utf8"));