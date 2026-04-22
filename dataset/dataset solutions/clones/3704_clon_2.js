"use strict"; /* Strict mode activated for cleaner code */

const processInput = ( inputString ) => {
    // Trim any leading/trailing whitespace and split the input into lines
    let dataLines = inputString.trim().split('\n');

    // Parse the first line to get the total number of items, though it's not directly used later
    const numItems = parseInt( dataLines[0] );

    // Parse the second line, splitting by space and converting each part to an integer
    const originalNumbers = dataLines[1].split(' ').map( ( element ) => parseInt( element ) );

    // Initialize an array to store computed differences
    let differencesList = [ ];

    // Iterate through the original numbers using their indices
    for ( let loopIndex in originalNumbers ) {
        // Calculate the difference: number at index minus (index + 1)
        let currentDifference = originalNumbers[loopIndex] - ( parseInt(loopIndex) + 1 );

        // Add the calculated difference to our list
        differencesList.push( currentDifference );
    }

    // Create a Set to store only the unique differences
    let distinctValuesSet = new Set( differencesList );

    // Convert the Set back to an array, map each unique value to its absolute value,
    // and then reduce them to find their sum. Finally, print the result.
    console.log(
        [ ...distinctValuesSet ]
            .map( ( val ) => Math.abs(val) )
            .reduce( ( accumulator, currentVal ) => accumulator + currentVal )
    );
};

// Read the standard input and pass it to our main processing function
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );