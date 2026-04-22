/*
 * This module contains a function designed to consume input data,
 * perform a sorting operation on a numerical array, and then
 * display the final sorted sequence along with the total count of swaps.
 */
function processInputData( inputStringData ) {

    // The entire received string is first broken down into an array of individual text lines.
    const inputLines = inputStringData.split('\n') ;

    /*
     * The initial line of input is parsed to determine the expected
     * total quantity of items within the primary numerical sequence.
     */
    const arrayLength = Number(inputLines.shift());

    // The subsequent line is expected to contain numbers separated by spaces; these are converted into a numeric array.
    const numericArray = inputLines.shift().split(' ').map(Number);

    // A variable to keep a tally of how many times elements are exchanged during the sorting process.
    let swapCount = 0;

    // This tracks how many elements from the right end of the array are already in their correct, final position.
    let processedElements = 0;

    // A logical indicator to signal if any element shifts happened in the current iteration, dictating further passes.
    let exchangeOccurred = 1; // '1' signifies true, '0' signifies false for this flag.

    // This loop persists as long as there are ongoing exchanges, implying the sequence isn't fully ordered.
    while ( exchangeOccurred ) {
        exchangeOccurred = 0; // Reset the flag at the commencement of each new pass.

        // Traverse the sequence from its conclusion towards the section that has not yet been ordered.
        for ( let currentIdx = arrayLength - 1; currentIdx > processedElements; currentIdx-- ) {
            // Evaluate if adjacent elements are out of sequence. If so, their positions are interchanged.
            if (numericArray[currentIdx] < numericArray[currentIdx - 1]) {
                // Execute the swap operation using a temporary storage variable.
                const tempValue = numericArray[currentIdx];
                numericArray[currentIdx] = numericArray[currentIdx - 1];
                numericArray[currentIdx - 1] = tempValue;

                exchangeOccurred = 1; // Mark the flag to signify that an exchange has taken place.
                swapCount++; // Increment the overall counter for element swaps.
            }
        }
        processedElements++; // One additional element is now correctly positioned from the right boundary.
    }

    // Display the elements of the now-sorted array, joined together by spaces.
    console.log(numericArray.join(' '));

    // Output the grand total of all element swaps executed.
    console.log(swapCount);
}


// The program's launch point: it reads data from the standard input stream and feeds it into the processing function.
processInputData( require('node:fs').readFileSync('/dev/stdin', 'utf8') );