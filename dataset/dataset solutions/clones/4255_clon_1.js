/*
 * This JavaScript file is a Type I clone.
 * It is functionally identical to the original source code,
 * with extensive modifications applied only to whitespace and comments.
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered in any way that would affect execution.
 */
( function ( ) {
  'use strict' ; // Activating strict mode for cleaner code practices.

  // Declare an array to hold all the input lines read from stdin.
  var lines = [ ] ;

  /*
   * Initialize the readline interface to asynchronously process input.
   * This setup listens for data coming from the standard input stream.
   */
  require ( 'readline' )
    . createInterface ( {
        input : process . stdin ,  // Assign standard input as the source.
        output : process . stdout // Assign standard output (though not used for direct output here).
    } )
    . on ( 'line' , function ( line ) {
        // For each line received, append it to the 'lines' array.
        lines . push ( line ) ;
    } ) ;

  // Attach an event listener for when the input stream signals its 'end'.
  process . stdin . on ( 'end' , function ( ) {
    /*
     * The following block of code was commented out in the original source.
     * It remains commented out here to preserve the Type I cloning rule,
     * which allows for modification or preservation of comments.
     */
    // lines . forEach ( function ( line ) {
    //   var tokens = line . split ( ' ' ) . map ( Number ) ;
    //   console . log ( tokens [ 0 ] + ' ' + tokens [ 1 ] ) ;
    // } ) ;
    ; // An intentionally placed empty statement, valid JavaScript syntax.

    // --- Start of the primary logic block ---
    // Parse the first line of input as an integer; this is N.
    var N = parseInt ( lines [ 0 ] ) ;
    var ans = 0 ; // Initialize the variable that will store our final answer.

    // Iterate from i = 0 up to N, inclusive.
    for ( var i = 0 ; i <= N ; i ++ ) {
      var test = i * i ; // Calculate the square of the current iteration variable 'i'.
      // If the calculated square is less than or equal to N, update 'ans'.
      // 'ans' will therefore hold the largest perfect square not exceeding N.
      if ( test <= N ) {
          ans = test ;
      }
    }

    // Output the computed answer to the standard console.
    console . log ( ans ) ;

    /*
     * This line was also commented out in the original.
     * It shows an alternative calculation that was not used in the final logic.
     */
    // console . log ( Math . pow ( parseInt ( lines [ 0 ] ) , 2 ) - parseInt ( lines [ 1 ] ) ) ;
    // --- End of the primary logic block ---
  } ) ;


} ) ( ) ;