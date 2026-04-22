// This JavaScript program processes numerical data read from standard input.
// It uses Node.js 'fs' module to read the input.

var input = require('fs').readFileSync('/dev/stdin', 'utf8') ; // Read the entire standard input as a UTF-8 string.


var Arr = ( input . trim() ) . split ( "\n" ) ; // Trim leading/trailing whitespace from the input and split it into an array of lines.


  while ( true ) { // Begin an infinite loop to process multiple test cases.

    // Extract the first line of the current test case, split it by space, and convert parts to numbers.
    var nS = Arr . shift() . split ( " " ) . map ( Number ) ;

    var n = nS [ 0 ] ; // Get the first number from the parsed line.
    var S = nS [ 1 ] ; // Get the second number from the parsed line.

    // Check for the termination condition: both n and S are zero.
    if ( n == 0 && S == 0 ) break ;


    var arr = [ ] ; // Declare an array to store frequency counts.

    // Initialize all elements of the 'arr' array to zero, up to index 100.
    for ( var i = 0 ; i <= 100 ; i ++ ) arr [ i ] = 0 ;


    // Read 'n' subsequent lines, each containing a number, and increment their counts in 'arr'.
    for ( var i = 0 ; i < n ; i ++ ) {
      var v = Arr . shift ( ) - 0 ; // Read a line, convert it to a number (using '- 0' trick), and store in 'v'.
      arr [ v ] ++ ; // Increment the count for the number 'v' in the 'arr' array.
    }


    var cnt = 0 ; // Initialize a counter variable to zero.

    /*
     *  The following block of code was commented out in the original source.
     *  It appears to be a nested loop intended to calculate 'cnt' based on 'arr' and 'S'.
     *  Whitespace changes are applied within this commented block as well, as per cloning rules.
     *
     *  for ( var i = 0 ;  i <= 100 ;  i ++ )  {
     *
     *     for ( var j = i + 1 ;  j <= 100 ;  j ++ )  {
     *
     *        if ( i + j > S )  cnt += Math . min ( arr [ i ] ,  arr [ j ] ) ;
     *
     *     }
     *  }
     */
    // The actual calculation for 'cnt' seems to be missing or intentionally left at 0 in this version.


    console . log ( cnt ) ; // Print the final value of 'cnt' to standard output.

  } // End of the main processing loop for test cases.