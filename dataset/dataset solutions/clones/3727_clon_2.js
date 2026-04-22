function ProcessInputData ( rawData ) {
  // This function processes the incoming raw data string.

  let processedLines = rawData . split ( "\n" ) ;

  const firstLineTokens = processedLines [ 0 ] . split ( " " ) ;

  const secondLineNumbers = processedLines [ 1 ] . split ( " " ) ;

  let countItems = firstLineTokens [ 0 ] ; // Total number of items (not directly used in calculation)

  let segmentSize = firstLineTokens [ 1 ] ; // The size of each segment for operations

  let finalResult = 0 ; // Stores the calculated final outcome

  let firstOnePosition = 0 ; // Tracks the position of the first '1' found

  const arrayLength = secondLineNumbers . length ; // The total length of the number array

  let leftCount = 1 ; // Number of elements to the left of the '1' (initially placeholder, later updated)

  let rightCount = 1 ; // Number of elements to the right of the '1' (initially placeholder, later updated)

  let adjustmentValue = 0 ; // A value used to adjust the final result

  // Iterate through the array to locate the initial '1'
  for ( let currentIdx = 0 ; currentIdx < arrayLength ; currentIdx ++ ) {
    if ( secondLineNumbers [ currentIdx ] === "1" ) { // Check for string '1'
      firstOnePosition = currentIdx ; // Store the position
      break ; // Exit loop once found
    }
  }

  leftCount = firstOnePosition ; // Number of elements before the '1'

  rightCount = arrayLength - 1 - firstOnePosition ; // Number of elements after the '1'

  // Check if the total span is within the segment size
  if ( ( leftCount + rightCount ) <= parseInt ( segmentSize ) ) {
    adjustmentValue = -1 ; // Set adjustment if span is small
  }

  // Process elements to the left until none remain
  while ( leftCount > 0 ) {
    finalResult = finalResult + 1 ; // Increment the operation count
    leftCount = leftCount - ( parseInt ( segmentSize ) - 1 ) ; // Reduce count by segment size minus one
  }

  // Process elements to the right until none remain
  while ( rightCount > 0 ) {
    finalResult = finalResult + 1 ; // Increment the operation count
    rightCount = rightCount - ( parseInt ( segmentSize ) - 1 ) ; // Reduce count by segment size minus one
  }

  // Apply final adjustment if the result is not zero
  if ( finalResult !== 0 ) {
    finalResult = finalResult + adjustmentValue ; // Add the calculated adjustment
  }

  console . log ( finalResult ) ; // Output the final computed value
}

// Invoke the main processing function with data read from standard input.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;