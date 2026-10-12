// This function acts as the primary entry point for processing input data.
function ProcessInput( initialInputString )
{
  // First, segment the raw string by newline characters.
  let parsedLines = initialInputString.split( "\n" );

  // Extract the total count of numbers from the very first line.
  let dataItemCount = parseInt( parsedLines[ 0 ],   10 ) ;

  // The actual numerical data is on the second line, space-separated.
  let textualNumbers = parsedLines[ 1 ].split( " " );

  // A container to hold the numerical representations.
  let numericDataArray = [ ] ;

  // Transform each textual number into an integer.
  for ( let indexCounter = 0; indexCounter < dataItemCount; indexCounter++ ) {
    let numericValue = parseInt( textualNumbers[ indexCounter ], 10 );
    numericDataArray[ indexCounter ] = numericValue;
  }


  // --- Conditional logic based on the quantity of input elements ---

  // Specific handling for exactly two elements.
  if ( dataItemCount === 2 ) {
    let finalDifference = numericDataArray[ 0 ] - numericDataArray[ 1 ];
    console.log( Math.abs( finalDifference ) ); // Display the absolute difference.
  }
  // Generic handling for more than two elements.
  else {

    // Compute the aggregate sum of all numbers in the array.
    let fullTotalSum = numericDataArray.reduce( ( acc, curr ) => acc + curr, 0 );

    // Variables for managing the dynamic partitioning of the sum.
    var currentSegmentSum = numericDataArray[ 0 ]; // 'var' for function-scope hoisting.
    var complementarySegmentSum = 0; // Also 'var' for similar reasons.

    // These variables will be hoisted to function scope, potentially `undefined` if their 'if' block is skipped.
    var firstHalfCandidate;
    var secondHalfCandidate;

    // Iterate through the data to find a suitable partition point.
    var loopIterator; // 'var' to ensure scope outside the loop.
    for ( loopIterator = 0; loopIterator <= dataItemCount; loopIterator++ ) {
      if ( currentSegmentSum < fullTotalSum / 2 ) {
        firstHalfCandidate = currentSegmentSum; // Store the current left part.
        secondHalfCandidate = fullTotalSum - firstHalfCandidate; // Store the current right part.
        // Increment the current segment sum using the next element.
        // This line can potentially access out-of-bounds if loopIterator+1 exceeds array length.
        currentSegmentSum = currentSegmentSum + numericDataArray[ loopIterator + 1 ];
      }
      else {
        complementarySegmentSum = fullTotalSum - currentSegmentSum; // Finalize the complementary sum.
        break; // Exit the loop once the condition is met.
      }
    }


    // --- Further specialized processing based on element quantity ---

    // Special case for three elements.
    if ( dataItemCount === 3 ) {
      finalDifference = currentSegmentSum - complementarySegmentSum;
      console.log( Math.abs( finalDifference ) ); // Output the absolute value of the calculated difference.
    }
    // General case for more than three elements.
    else {

      let partitionDifferenceAlpha = currentSegmentSum - complementarySegmentSum; // Calculate the first potential difference.

      // This calculation uses `loopIterator + 2` which might be out of array bounds.
      // It also uses `currentSegmentSum` which is the final value from the loop.
      let extraneousValue = currentSegmentSum + numericDataArray[ loopIterator + 2 ];

      // Calculate the second potential difference.
      // If `firstHalfCandidate` or `secondHalfCandidate` were never assigned (i.e., loop's `if` block skipped),
      // this will result in `NaN` (undefined - undefined).
      let partitionDifferenceBeta = firstHalfCandidate - secondHalfCandidate;

      partitionDifferenceAlpha = Math.abs( partitionDifferenceAlpha ); // Ensure positive.
      partitionDifferenceBeta = Math.abs( partitionDifferenceBeta ); // Ensure positive.

      // Print the smaller of the two calculated absolute differences.
      if ( partitionDifferenceAlpha < partitionDifferenceBeta ) {
        console.log( partitionDifferenceAlpha );
      }
      else {
        console.log( partitionDifferenceBeta );
      }
    }
  } // End of the 'more than two elements' block.
} // End of the main processing function.


// Do not alter any code below this point; it handles standard input/output operations.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );