// Activate the standard input stream for reading.
process.stdin.resume();

// Set the character encoding for the input.
process.stdin.setEncoding('utf8');

// Core function to process and sort the provided data.
function initiateSorting (incomingData) {
    // Process the raw input: remove leading/trailing whitespace and split into lines.
    incomingData = incomingData.trim() . split('\n');
    
    // Parse the first line to get the total number of elements.
    const elementCount = Number(incomingData[0]);
    
    // Convert the second line into an array of numerical values.
    let numberSequence = incomingData[1].split(' ').map(Number);

    // This section implements the insertion sort algorithm.
    // The outer loop iterates through the array from the second element.
    for (let currentPosition = 1; currentPosition < elementCount; ++currentPosition) {
        // Output the array's state before sorting the element at the currentPosition.
        console.log(numberSequence.join(' '));

        // Store the value of the element to be inserted into its correct place.
        let keyElement = numberSequence[currentPosition];
        // Initialize an index for comparison, starting just before the keyElement.
        let comparisonIndex = currentPosition - 1;
        
        // Shift elements that are larger than keyElement to the right.
        while (comparisonIndex >= 0 && numberSequence[comparisonIndex] > keyElement) {
            numberSequence[comparisonIndex + 1] = numberSequence[comparisonIndex];
            comparisonIndex--;
        }
        
        // Place the keyElement into its sorted position within the sub-array.
        numberSequence[comparisonIndex + 1] = keyElement;
    }

    // Print the fully sorted array to the console.
    console.log(numberSequence.join(' '));
}

// Read the entire content of the standard input file and pass it to the sorting function.
initiateSorting(require('fs').readFileSync('/dev/stdin', 'utf8'));