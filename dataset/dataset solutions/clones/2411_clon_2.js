function ProcessInput(rawData) { /* This function processes the incoming data stream. */
    var textRows = rawData.split('\n'); // Divide the raw input into individual lines.
    var arraySize = Number(textRows[0]); // Extract the size of the subsequent number array.
    var numberSequence = textRows[1].split(' ').map(elementValue => Number(elementValue)); /* Parse the second line into an array of numeric values. */

    var prefixSums = [0]; // Initialize an array to store cumulative sums, starting with zero.
    numberSequence.reduce( (previousSum, currentValue) => { /* Compute and store the running total. */
        prefixSums.push(previousSum + currentValue);
        return previousSum + currentValue;
    }, 0 );

    console.log(prefixSums); // Output the generated array of prefix sums for debugging.

    var absoluteDifferences = []; // Prepare an array to hold the calculated absolute differences.

    for ( var indexIterator = 0; indexIterator < arraySize - 1; indexIterator++ ) { /* Iterate through possible split points. */
        absoluteDifferences.push( Math.abs( prefixSums[indexIterator] - ( prefixSums[arraySize] - prefixSums[indexIterator] ) ) ); // Calculate difference between two parts.
    }

    console.log(Math.min(...absoluteDifferences)); // Print the smallest absolute difference found.
}

ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') ); /* Invoke the main processing function with data from standard input. */