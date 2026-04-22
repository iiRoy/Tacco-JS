/*
 * This is the main function that processes the input.
 * It determines the number with the maximum consecutive divisions by 2.
 */
function     Main(    input    )    {

  // Declare and initialize variable N by converting input to a number.
  var N    =    Number(input)    ;


  /*
   * Initialize the 'record' array.
   * If N is 1, the record starts with [1, 0].
   * Otherwise, it starts with [0, 0].
   */
  if ( N == 1 ) {
    var record = [ 1 , 0 ] ;
  } else {
    var record = [ 0 , 0 ] ;
  }



  // Loop from 1 up to N to find the number with the most divisions by 2.
  for ( var i = 1 ; i <= N ; i++ )
  {
    // Initialize a counter for the current number 'i'.
    var count = 0 ;

    // Call the helper function 'check' to calculate the count.
    count = check( i , count ) ;


    // If the current count is greater than the recorded maximum, update the record.
    if ( record[1] < count ) {
      record = [ i , count ] ;
    }
  }


  // This is a recursive helper function to count how many times a number 'i' can be divided by 2.
  function    check(    i    ,    t    )
  {
    // Check if 'i' is an even number.
    if ( i % 2 == 0 )
    {
      // Increment the counter 't'.
      ++t ;
      // Recursively call 'check' with 'i' divided by 2.
      return check( i / 2 , t ) ;
    }
    else
    {
      // If 'i' is odd, return the current count 't'.
      return t ;
    }
  }


  // Finally, print the number that had the maximum consecutive divisions by 2.
  console.log( record[0] ) ;
}


// Execute the Main function with input read from standard input.
Main( require("fs").readFileSync( "/dev/stdin" , "utf8" ) ) ;