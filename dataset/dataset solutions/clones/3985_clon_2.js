function ProcessInput ( rawData )
{
  // Split the raw input string by spaces to obtain individual tokens
  const tokenizedData = rawData . split ( ' ' );

  // Parse the first token as the integer for the lower boundary
  let lowerBoundary = parseInt ( tokenizedData [ 0 ], 10 );

  // Parse the second token as the integer for the upper boundary
  let upperBoundary = parseInt ( tokenizedData [ 1 ], 10 );

  // Initialize a counter for numbers that satisfy the given criteria
  let validNumberCount = 0;

  // Iterate for the first digit of the five-digit palindrome (1-9)
  for ( let digitOne = 1 ; digitOne <= 9 ; digitOne ++ )
  {
    // Iterate for the second digit (0-9)
    for ( let digitTwo = 0 ; digitTwo <= 9 ; digitTwo ++ )
    {
      // Iterate for the third digit (0-9)
      for ( let digitThree = 0 ; digitThree <= 9 ; digitThree ++ )
      {
        // Construct the five-digit palindrome 'digitOne digitTwo digitThree digitTwo digitOne'
        // This is equivalent to (10000 * digitOne) + (1000 * digitTwo) + (100 * digitThree) + (10 * digitTwo) + (1 * digitOne)
        // Which simplifies to 10001 * digitOne + 1010 * digitTwo + 100 * digitThree
        let constructedNumber = 10001 * digitOne + 1010 * digitTwo + 100 * digitThree;

        // Check if the constructed number falls within the specified range
        if ( lowerBoundary <= constructedNumber && constructedNumber <= upperBoundary )
        {
          // If it does, increment the counter
          validNumberCount++;
        }
      }
    }
  }

  // Output the final count of valid numbers
  console.log ( validNumberCount );
}

// Read the entire standard input as a UTF-8 string and pass it to the main processing function
ProcessInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );