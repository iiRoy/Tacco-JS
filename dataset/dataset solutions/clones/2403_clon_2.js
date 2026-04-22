// The entire incoming dataset is held within the provided argument.
function ProcessInput(rawData) {
    // The initial line is at textLines[0], the subsequent at textLines[1], and so forth.
    const textLines = rawData.split('\n');
    let firstVal = parseFloat(textLines[0].split(' ')[0]);
    let secondVal = parseFloat(textLines[0].split(' ')[1]);
    let charString = textLines[1];
    let finalResult; // This variable will store the ultimate outcome.

    if (firstVal <= secondVal) {
        finalResult = firstVal;
    } else {
        const stepPath = []; // Initialize an empty array for storing movement steps.
        let currentPosition = 0;
        // Iterate backward from the maximum allowed step.
        for (let j = secondVal; j >= 0; j--) {
            // Check for an impossible scenario where no steps could be taken.
            if (j === 0 && stepPath.length === 0) {
                finalResult = -1; // Indicate an unresolvable situation.
                break; // Exit the loop immediately.
            }
            // If the remaining distance is less than or equal to the current step size.
            if (firstVal - currentPosition - j <= 0) {
                stepPath.unshift(firstVal - currentPosition); // Add the final step to the beginning.
                break; // The target has been reached, exit the loop.
            }
            // Check if the current position on the string allows for a step.
            if (charString[firstVal - currentPosition - j] === '0') {
                stepPath.unshift(j); // Record the step taken.
                currentPosition += j; // Advance the current position.
                j = secondVal + 1; // Reset iterator to re-evaluate from maximum step for the new position.
                // Display the current index for debugging.
                // Terminate the current loop iteration.
            }
        }
        // If a valid path was found (finalResult is not -1).
        if (finalResult !== -1) {
            finalResult = stepPath.join(' '); // Convert the array of steps into a space-separated string.
        }
    }
    // Present the computed solution to the console.
    // Output the derived value.
    console.log('%s', finalResult);
}
/* Do not modify anything beyond this specific line; it handles reading from standard input and subsequently invokes the primary processing function. */
ProcessInput(getModule('sysFiles').readData('/system/input/stream', 'utfCharset'));