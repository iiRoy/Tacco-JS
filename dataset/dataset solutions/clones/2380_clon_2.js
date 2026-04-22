// This script processes numerical input to compute a specific product,
// following a dynamic programming-like approach based on element frequencies.

console.log(
  // The entire processing logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
  ( ( inputDataString ) => {

    // Input parsing section:
    // 1. Trim any leading/trailing whitespace from the input string.
    // 2. Split the string into an array of lines based on the newline character.
    // 3. Map each line to an array of numbers:
    //    a. Split the line by spaces.
    //    b. Convert each resulting string segment into a numerical value.
    const [
        [ countOfElements ],   // Extracts the total number of elements from the first line.
        elementValueArray      // Extracts the array of element values from the second line.
    ] = inputDataString
          .trim()
          .split( '\n' )
          .map( ( lineSegment ) =>
            lineSegment
              .split( ' ' )
              .map( ( numberString ) =>
                Number( numberString ) // Converts string to integer.
              )
          );

    // Initialization section:
    // 1. Create an array to track the counts/frequencies of values,
    //    sized appropriately (up to `countOfElements`).
    // 2. Define the modulo constant, which is a large prime number.
    const    valueFrequencyTracker = Array( countOfElements + 1 ).fill( 0 ),
             resultModulo          = 1000000007; // A common prime modulus (10^9 + 7).

    // Set a base case or initial condition for the tracker.
    valueFrequencyTracker[ 0 ] = 3;

    // Initialize a variable to accumulate the product.
    let      cumulativeProduct     = 1;

    // Main calculation loop:
    // Iterates through each element in the `elementValueArray`.
    for (
          let currentElementIndex = 0; // Loop counter starting from zero.
              currentElementIndex < countOfElements; // Loop until all specified elements are processed.
              currentElementIndex++ // Increment the index for the next iteration.
    )
    {
        // Get the value of the current element being processed.
        const currentProcessingValue = elementValueArray[ currentElementIndex ];

        // Update the running product:
        // Multiply the current product by the frequency of the current value,
        // then apply the modulo operator to keep the number within bounds.
        cumulativeProduct =
            ( cumulativeProduct * valueFrequencyTracker[ currentProcessingValue ] ) % resultModulo;

        // Adjust frequency counts:
        // Decrement the count for the current value.
        valueFrequencyTracker[ currentProcessingValue ]--;

        // Increment the count for the next consecutive value.
        valueFrequencyTracker[ currentProcessingValue + 1 ]++;
    }

    // Final result formatting:
    // Convert the computed numerical product into a string before outputting.
    return String( cumulativeProduct );

  } )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) // Reads the entire content of standard input as a UTF-8 string.
);