/*
 * This function is designed to process raw textual input,
 * parse numerical data, and compute a specific sum based on frequency analysis
 * and a given threshold for removal.
 */
function processInputData(rawTextContent) {
    // Divide the entire received string into an array of lines,
    // using the newline character as a delimiter.
    const inputLines = rawTextContent.split('\n');

    // From the first line, extract and parse two integer values.
    // The first value might represent an initial count or total.
    const firstParameter = parseInt(inputLines[0].split(' ')[0], 10);
    // The second value acts as a threshold for filtering or removal operations.
    const removalThreshold = parseInt(inputLines[0].split(' ')[1], 10);

    // Take the second line, split it by spaces, convert each part to an integer,
    // and then sort the resulting array of numbers in ascending order.
    const numericalSequence = inputLines[1].split(' ').map(numStr => parseInt(numStr, 10)).sort((valA, valB) => valA - valB);

    // Initialize an empty array to store the counts of consecutive identical numbers.
    const elementFrequencies = [];
    // Set the first element of the sorted sequence as the initial reference element.
    let activeElement = numericalSequence[0];
    // Start counting occurrences for the active element.
    let currentFrequency = 1;

    // Iterate through the numerical sequence starting from the second element.
    // This loop's purpose is to aggregate the frequencies of each unique number.
    for (let indexPointer = 1; indexPointer <= numericalSequence.length; indexPointer++) {
        // If the element at the current index is the same as the active element,
        // increment its frequency count.
        if (numericalSequence[indexPointer] === activeElement) {
            currentFrequency++;
        } else {
            // If a different element is encountered (or end of array, as numericalSequence[length] is undefined),
            // store the accumulated frequency of the previous active element.
            elementFrequencies.push(currentFrequency);
            // Reset the frequency counter for the new element.
            currentFrequency = 1;
        }
        // Update the active element to the current element for the next comparison.
        activeElement = numericalSequence[indexPointer];
    }

    // Sort the collected frequencies themselves in ascending order.
    // This prepares the list for selection of the smallest frequency groups.
    elementFrequencies.sort((valA, valB) => valA - valB);

    // Declare a variable to hold the cumulative sum of frequencies that are not 'removed'.
    let calculatedSum = 0;

    // Check if the total number of unique element frequencies is less than or equal
    // to the specified removal threshold.
    if (elementFrequencies.length <= removalThreshold) {
        console.log(calculatedSum); // If so, no frequencies are kept, so the sum is zero.
        return; // Exit the function immediately.
    }

    // Iterate through the sorted list of element frequencies.
    // The goal is to sum the smallest frequencies until a certain condition is met.
    for (let loopCounter = 0; loopCounter < elementFrequencies.length; loopCounter++) {
        // Retrieve the frequency value at the current loop position.
        const currentFrequencyValue = elementFrequencies[loopCounter];
        // Add this frequency value to our running total.
        calculatedSum += currentFrequencyValue;

        // Determine if the number of remaining frequencies (after the current one)
        // is less than or equal to the removal threshold.
        // This condition signals that we have summed the correct set of smallest frequencies.
        if ((elementFrequencies.length - (loopCounter + 1)) <= removalThreshold) {
            console.log(calculatedSum); // Output the final computed sum.
            return; // Terminate function execution after printing the result.
        }
    }
}

// Call the primary processing routine, feeding it content read from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));