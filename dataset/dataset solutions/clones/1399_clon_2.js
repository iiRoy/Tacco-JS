var   rawInputContent = require('fs') .readFileSync('/dev/stdin',  'utf8' );

// Split the entire input content into an array of individual text blocks,
// using the newline character as a delimiter.
 var processedEntries=rawInputContent.split('\n') ;

// Begin an indefinite processing loop.
 while (true   ) {
    // Retrieve the very first entry from our collection and remove it.
    // This allows us to process entries sequentially.
	var currentExpression = processedEntries.shift(  );

    // Check for a specific termination condition:
    // If the second part of the current expression (after splitting by space)
    // is a question mark, then it's time to exit the loop.
	if (  currentExpression.split(' ')[1] === '?' ) { break; }

    // Evaluate the arithmetic expression contained within the current entry.
    // Then, take the floor (round down to the nearest integer) of the result.
    // Finally, display this computed integer to the console.
	console.log( Math.floor( eval( currentExpression ) ) );
}