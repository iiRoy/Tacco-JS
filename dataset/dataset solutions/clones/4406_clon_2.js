"use strict"; // Enforce strict parsing and error handling for better code quality

// Main processing unit for incoming data streams
const processInputData = rawInputText => {

  // Step 1: Clean and segment the raw input string
  // Remove extraneous whitespace and divide into an array of individual lines
  let inputLines = rawInputText . trim () . split ( "\n" ) ;

  // Step 2: Extract and parse the initial count (often the first line, though not used in this specific calculation)
  const initialCount = parseInt( inputLines[0] ) ;

  // Step 3: Process the array of numbers from the second line
  // - Split the string into individual number strings
  // - Convert each string to an integer
  // - Sort the resulting numeric array in ascending order
  const numericValues = inputLines[ 1 ] . split ( " " ) . map ( stringItem => parseInt ( stringItem ) ) . sort ( ( firstVal , secondVal ) => firstVal - secondVal ) ;
  
  // Step 4: Initialize an array to store numbers that appear as consecutive duplicates
  let foundDuplicates = [ ] ;
  
  // Step 5: Iterate through the sorted numeric values to identify adjacent identical elements
  for ( let currentIndex in numericValues ) {
      // Ensure we don't go out of bounds and check if the current element matches the next one
      if ( numericValues[ currentIndex ] === numericValues[ parseInt ( currentIndex ) + 1 ] ) {
        // If a duplicate pair is detected, add the value to our list
        foundDuplicates . push ( numericValues[ currentIndex ] ) ;
      }
  }
  
  // Step 6: Sort the collected duplicate values in descending order
  foundDuplicates . sort ( ( valX , valY ) => valY - valX ) ;

  // Step 7: Create a Set to extract only the unique values from our list of duplicates
  // This effectively removes any repeated entries within the 'foundDuplicates' array
  const distinctDuplicates = new Set ( foundDuplicates ) ;

  // Step 8: Calculate and output the final result
  // If there are at least two distinct duplicate values, multiply the two largest unique values.
  // Otherwise, if there aren't enough distinct pairs, the result is zero.
  console.log ( foundDuplicates . length ? [ ...distinctDuplicates ][0] * [ ...distinctDuplicates ][1] : 0 ) ;
}

// Entry point: Read data from standard input (e.g., a piped file or console input)
// and then pass it to our primary processing function.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;