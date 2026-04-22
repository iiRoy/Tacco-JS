"use strict";

// This function orchestrates the primary logic of the application.
const processInputData = rawInputText => {
  // Normalize the input string: remove leading/trailing whitespace and separate lines.
  rawInputText = rawInputText . trim() . split ( '\n' ) ;

  // Parse the first line to get the total number of elements.
  const totalElements = Number . parseInt ( rawInputText [ 0 ], 10 ) ;

  // Process the second line: split by spaces and convert each part to an integer.
  const numericValues = rawInputText [ 1 ] . split ( ' ' ) . map ( strVal => Number . parseInt ( strVal, 10 ) ) ;

  // Create a collection to hold only the distinct numbers from the input array.
  const distinctValueCollection = new Set ( numericValues ) ;
  // Convert the set of unique values back into an array for indexed iteration.
  const uniqueNumbersList = Array . from ( distinctValueCollection ) ;

  // Initialize a variable to accumulate the final result.
  let cumulativeSum = 0 ;

  // Prepare a frequency table to count occurrences of numbers up to a certain limit.
  // The table size is set to 100001, effectively covering indices 0 to 100000.
  const occurrenceCounter = new Array ( 100001 ) . fill ( 0 ) ;

  // Iterate through each number in the main input array.
  for ( let currentIndex = 0 ; currentIndex < totalElements ; currentIndex ++ ) {
      // Numbers exceeding the maximum allowed index for the frequency table are counted separately.
      if ( numericValues [ currentIndex ] > 100000 ) {
        cumulativeSum ++ ; // Increment the overall sum for out-of-range numbers.
      } else {
        // For numbers within range, update their frequency in the counter table.
        occurrenceCounter [ numericValues [ currentIndex ] ] ++ ;
      }
  }

  // This section appears to re-evaluate counts but has no net effect on the cumulative sum.
  // It demonstrates a specific pattern of conditional logic that results in no change.
  for ( let uniqueIdx in uniqueNumbersList ) {
    // Retrieve the count for the current unique number from the frequency table.
    let currentElementCount = occurrenceCounter [ uniqueNumbersList [ uniqueIdx ] ] ;

    // This condition will always be false, as currentElementCount is directly assigned from occurrenceCounter.
    if ( currentElementCount < occurrenceCounter [ uniqueNumbersList [ uniqueIdx ] ] ) {
        cumulativeSum += currentElementCount ; // This branch is unreachable.
    } else {
        // This branch is always taken, but the operation adds zero to cumulativeSum.
        cumulativeSum += currentElementCount - occurrenceCounter [ uniqueNumbersList [ uniqueIdx ] ] ;
    }
  }

  // Output the computed final result to the console.
  console . log ( cumulativeSum ) ;
}

// Invoke the main processing function with data read from standard input.
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;