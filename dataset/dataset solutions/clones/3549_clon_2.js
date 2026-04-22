'use strict'; /*  Strict mode activation  */

const processInput = ( sourceText ) => {
    // Divide the incoming string into an array of individual lines
    const dataLines = sourceText.split('\n');

    // Retrieve the initial count from the very first line and cast it to a numerical value
    const expectedCount = Number(dataLines[0]);

    // Eliminate the first element from the array, as it has already been processed
    dataLines.shift();

    /*
     * Generate a new array containing only the unique elements from the 'dataLines' array.
     * This is achieved by checking if the current element's first occurrence index
     * matches its current position in the array.
     */
    let uniqueEntries = dataLines.filter(
        ( currentItem, currentIndex, fullArray ) => fullArray.indexOf(currentItem) === currentIndex
    );

    // Evaluate if the quantity of distinct items corresponds to the initially specified count
    if ( uniqueEntries.length !== expectedCount ) {
        console.log('Negative'); // Print 'Negative' if the counts are not aligned
        return; // Halt the function's execution
    } else {
        // Traverse through the modified lines, commencing from the second element, to validate a sequential rule
        for ( let k = 1; k < dataLines.length; k += 1 ) {
            /*
             * Verify that the concluding character of the preceding line
             * does not differ from the initial character of the current line.
             */
            if ( dataLines[k - 1].slice(-1) !== dataLines[k].slice(0, 1) ) {
                console.log('Negative'); // Display 'Negative' if the sequential rule is violated
                return; // Cease the function's operation
            }
        }
    }

    // If all established conditions are met, indicate a successful outcome
    console.log('Affirmative');
};

// Commence the data handling process by acquiring content from the standard input stream
processInput(
    require('node:fs').readFileSync( '/dev/stdin', 'utf-8' )
);