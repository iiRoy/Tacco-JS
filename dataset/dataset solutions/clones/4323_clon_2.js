'use strict';
/**
 * This module handles the processing of input data from standard input.
 * It reads a sequence of numbers, performs some operations, and logs the result.
 */
function ProcessInputData(rawDataString) {
    // Trim any leading/trailing whitespace from the raw input string,
    // then split it into an array of strings using one or more whitespace characters as delimiters.
    // Finally, convert each string element to a numerical value.
    const numericValues = rawDataString.trim().split(/\s+/).map(  (currentStringValue) => currentStringValue - 0  );

    // The first number in the input is shifted off and stored, but not used further in this specific logic.
    let firstElementCount = numericValues.shift();

    // Initialize two separate arrays to store processed data.
    let primarySet = [  ];
    let secondarySet = [  ];

    // Loop until all elements have been processed from the numericValues array.
    // Elements are popped from the end of numericValues and pushed into secondarySet and primarySet in a specific order.
    while (  numericValues.length > 0  ) {
        secondarySet.push( numericValues.pop() ); // Add the last element to the secondary collection.
        primarySet.push( numericValues.pop() );   // Then add the new last element (which was the second to last originally) to the primary collection.
    }

    // Find the maximum value within the primarySet.
    // Math.max.apply is used to find the maximum value from an array.
    let maximumPrimaryValue = Math.max.apply( undefined, primarySet );

    // Determine the index of the maximumPrimaryValue within primarySet.
    // Use this index to retrieve the corresponding value from secondarySet.
    let correspondingSecondaryValue = secondarySet[ primarySet.indexOf(maximumPrimaryValue) ];

    // Output the sum of the maximum primary value and its corresponding secondary value to the console.
    console.log(  maximumPrimaryValue + correspondingSecondaryValue  );
}

// Read the entire content from standard input synchronously using Node.js 'fs' module,
// decode it as UTF-8, and then pass it to the main processing function.
ProcessInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );