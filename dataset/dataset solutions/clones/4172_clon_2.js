/* This function processes the incoming text data to perform a specific calculation.
 * It identifies the number of times an array of integers can be simultaneously
 * divided by two before at least one element becomes odd. */
function processInputData(inputContent)
{
  // Extract the relevant line from the input and split it into an array of string representations of numbers.
  let    numericValues = inputContent
    .split(   "\n"   )
    [1]
      .split( " " ) ;
  // Initialize a counter to track the number of halving operations.
  let halvingIterations = 0;

  /* Begin a loop that continues as long as all numbers in the array are even.
   * The 'every' method implicitly converts string elements to numbers for the modulo operation. */
  while ( numericValues.every( elementToCheck => ( elementToCheck % 2 === 0 ) ) )
  {
    // Increment the counter for each successful iteration of halving.
    halvingIterations++;

    // Apply the halving operation to each number in the array.
    // The 'map' method will convert string elements to numbers, perform division, and result in an array of numbers.
    numericValues = numericValues.map( currentValue => currentValue / 2 );
  }

  // Output the final count of halving iterations to the console.
  console.log( halvingIterations ) ;
}

// Invoke the primary processing function with content read from standard input.
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;