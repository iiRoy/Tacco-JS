'use strict'   ;  /* This file uses strict mode for better error handling and cleaner code */


const   main   =   ( input )   =>   {

  /*
   * The first line of input specifies the number of elements 'n'.
   * The second line contains space-separated numbers which form the array 'a'.
   */
  const   n    =    parseInt( input[0] ,   10 );
  const   a    =    input[1] .  split( ' ' ) .  map(  val   =>   parseInt( val ,   10 )  );


  // This line is commented out, but could be used for debugging purposes:
  // console.log(n, a);


  // Loop 'n' times to find and "remove" the minimum element in each iteration
  for ( let   i   =   0 ;   i   <   n ;   i++ )   {

    // Find the minimum value in the array 'a' and get its index
    let   minIndex   =   a .  indexOf(  Math .  min .  apply(  null ,   a  )  );

    // Output the 1-based index of the current minimum element
    console .  log(  minIndex + 1  );

    /*
     * Replace the minimum element with a very large number (100000).
     * This effectively ensures it won't be picked as the minimum in subsequent iterations.
     * The problem constraints imply that 100000 is larger than any possible input value.
     */
    a[ minIndex ]   =   100000 ;

  }

};


// Read input from standard input, decode as UTF-8, split by newlines, and pass to the main function
main(  require( "fs" ) .  readFileSync( "/dev/stdin" ,   "utf8" ) .  split( '\n' )  );