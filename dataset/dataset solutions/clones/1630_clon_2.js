/* This function orchestrates the primary data processing flow. */
const processInputData = ( rawData ) => {

  // Extract the relevant sequence string from the raw input, discarding the first line.
  const [ , sequenceString ] = rawData . trim ( ) . split ( '\n' ) ;
  // Convert the sequence string into an array of individual characters for easier manipulation.
  const characterArray = Array . from ( sequenceString ) ;

  let whiteCount = 0 ; /* Counter for white elements. */
  let redCount = 0 ; /* Counter for red elements. */
  let swapOperations = 0 ; /* Tally of rearrangement actions. */

  // Initialize a pointer to the rightmost end of the array.
  let rightmostRedIndex = characterArray.length - 1;


  // First pass: Determine the initial distribution of 'W' and 'R' characters.
  for ( let currentChar of characterArray )
  {
    currentChar === 'W' ? whiteCount++ : redCount++ ;
  }


  // Second pass: Iterate from the left to find 'W's that need to be moved.
  for ( let leftPointer = 0 ; leftPointer < rightmostRedIndex ; leftPointer++ )
  {
    // If the character at the current left position is 'W', it needs to be swapped.
    if ( characterArray [ leftPointer ] === 'W' )
    {
      // Move the right pointer inwards until a non-'W' (i.e., 'R') is found or pointers cross.
      while ( characterArray [ rightmostRedIndex ] === 'W' )
      {
        rightmostRedIndex-- ;
      }

      // If the pointers have crossed or met, no more valid swaps can be made.
      if ( leftPointer >= rightmostRedIndex )
      {
        break ;
      }

      // Perform the swap: 'W' at leftPointer with 'R' at rightmostRedIndex.
      [ characterArray [ leftPointer ] , characterArray [ rightmostRedIndex ] ] = [ 'R' , 'W' ] ;
      swapOperations++ ; // Increment the swap counter.
      rightmostRedIndex-- ; // Move the right pointer inwards after a successful swap.
    }
  }
  
  // Output the minimum of total swaps, white count, or red count.
  return console . log ( Math . min ( swapOperations , Math . min ( whiteCount , redCount ) ) ) ;
};

// Conditional execution: If a specific environment variable is set, run tests; otherwise, process standard input.
process . env . RUN_UNIT_TESTS ? performTests ( ) : processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// Placeholder function for unit testing, if the environment variable is set.
const performTests = () => { /* No actual tests implemented here; this is for structural completeness. */ }