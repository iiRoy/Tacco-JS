function processInput ( rawData ) {
  // Trim any leading or trailing whitespace from the raw input string
  const processedText = rawData.trim( ) ;

  let distinctSegmentCount = 0 ; // This variable will track the number of unique segments found
  let lastIdentifiedSegment = '' ; // Stores the most recently confirmed unique segment
  let currentAccumulatedPart = '' ; // Accumulates characters to form the current segment being evaluated

  // Loop through the processed text starting from the second character (index 1)
  // The loop continues as long as the current character index is less than the total length of the text
  for ( let charIndex = 1 ; processedText.length > charIndex ; charIndex++ ) {
    // Append the character at the current index to the accumulator
    currentAccumulatedPart += processedText [ charIndex ] ;

    // Check if the currently accumulated part is identical to the last identified unique segment
    if ( currentAccumulatedPart === lastIdentifiedSegment ) {
      // If they are identical, it means we've repeated the pattern, so we skip to the next iteration
      continue ;
    }

    // If the accumulated part is not identical to the last one, it's a new unique segment
    lastIdentifiedSegment = currentAccumulatedPart ; // Update the last identified unique segment
    currentAccumulatedPart = '' ; // Reset the accumulator to start building the next segment
    distinctSegmentCount++ ; // Increment the counter for unique segments
  }

  // Output the final count of distinct segments to the console
  console.log ( distinctSegmentCount ) ;
}

// Read input from standard input using Node.js file system module
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;