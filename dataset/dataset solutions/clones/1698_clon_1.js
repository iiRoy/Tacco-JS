/*
 * This function finds the index of the maximum element in an array.
 * It assumes the array contains BigInts or numbers comparable to BigInts
 * and initializes max with a BigInt.
 */
const    maxIdx =  ( arr ) =>    {
  // Initialize max value to a very small BigInt
  let   max   =   -1n;

  // Initialize index of max value
  let   idx   =   -1;

  /*
   * Iterate through each element of the array
   * to find the largest value and its corresponding index.
   */
  for   ( let i = 0 ;   i < arr.length ;   i++ )
  {
    if  ( arr[i]   >   max )   {
      // If current element is greater, update max and idx
      max   =   arr[i] ;
      idx   =   i    ;
    }
  }

  // Return the index of the maximum element found
  return  idx  ;
}


/**
 * The main function processes the input to solve a specific problem.
 * It reads numbers, sorts them, and then performs a series of operations
 * to calculate a final sum based on inserting new elements into an array.
 * @param {string} input - The raw input string containing numbers.
 */
const   main    =   (  input  )   =>    {
    // Clean and parse the input string into an array of lines
    input   =   input . trim () . split ( '\n' ) ;

    // Extract numbers from the second line, convert them to BigInts
    const   nums    =   input[1] . split ( ' ' ) . map ( v  =>  BigInt ( v ) ) ;

    // Sort the numbers in descending order
    nums . sort ( ( a , b )  =>  b  -  a ) ;


    // Initialize the result array 'r' with the largest number
    let   r   =   [ nums . shift () ] ;

    // Initialize the answer sum
    let   ans   =   0n ;

    // Loop while there are still numbers left to process
    while   ( nums . length )   {
        // Get the next number from the sorted list
        const   n   =   nums . shift () ;

        // Find the index of the maximum element in 'r'
        const   i   =   maxIdx ( r ) ;
        // Add the maximum element to the running total 'ans'
        ans   +=   r[i] ;

        // Reconstruct 'r' by splitting it, inserting 'n' twice, and joining
        r   =   [ ... r . slice ( 0 , i ) , n , n , ... r . slice ( i + 1 ) ] ;
    }

    // Output the final calculated answer
    console . log ( `${ans}` ) ;
}

// Conditional execution based on environment variable
// If MYTEST is set, call test(), otherwise read from stdin and call main()
process . env . MYTEST
  ? test ()
  : main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// End of script.