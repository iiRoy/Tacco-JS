(function(sourceData) {
    // Helper function for numeric sorting in ascending order
    const ascendNumeric = (valA, valB) => valA - valB;

    // Split the raw input data into an array of individual lines.
    // Trim any leading/trailing whitespace from the entire input block.
    let dataLines = sourceData.trim().split('\n');

    // Initialize a counter to keep track of the number of entries processed.
    let entryCounter = 0;

    // Loop through each line in the dataLines array until it's empty
    // or a specific termination condition is encountered.
    while (dataLines.length > 0) {
        entryCounter++; // Increment the counter for the current processing iteration.

        // Retrieve and remove the first line from the array for processing.
        const currentLine = dataLines.shift();

        // Guard clause: Skip processing if the current line is empty or just whitespace.
        if (!currentLine || currentLine.trim() === '') {
            continue; // Move to the next line.
        }

        // Split the current line by space to get its string components.
        const stringComponents = currentLine.split(' ');

        // Validation: Ensure the line contains exactly two components.
        // If not, it's an invalid format, so skip this line.
        if (stringComponents.length !== 2) {
            // In a real application, you might log an error here.
            // console.error(`Skipping invalid line format at entry ${entryCounter}: "${currentLine}"`);
            continue; // Proceed to the next line.
        }

        // Explicitly parse the string components into base-10 integers.
        const firstValue = parseInt(stringComponents[0], 10);
        const secondValue = parseInt(stringComponents[1], 10);

        // Check for the termination condition or invalid number inputs.
        // If either value is not a number (NaN) or both are zero, stop execution.
        if (isNaN(firstValue) || isNaN(secondValue) || (firstValue === 0 && secondValue === 0)) {
            // Exit the entire function, as per the original's 'return' behavior.
            return;
        }

        // Create an array with the two parsed numeric values.
        const numericPair = [firstValue, secondValue];

        // Sort the pair of numbers in ascending order using the predefined helper function.
        numericPair.sort(ascendNumeric);

        // Output the sorted numbers, formatted as a space-separated string.
        console.log(`${numericPair[0]} ${numericPair[1]}`);
    }

    // Optional: A message to indicate that all available lines were processed
    // without hitting the '0 0' termination condition.
    // console.log(`All ${entryCounter} entries processed without termination.`);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));