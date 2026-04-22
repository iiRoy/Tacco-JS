/*
This is a Type I clone of the original JavaScript source file.
All identifiers, operators, and expressions are strictly preserved.
Only whitespace and comments have been altered significantly
to produce a visually distinct, yet functionally identical, code fragment.
*/

// Original shebang: #!/usr/bin/env node $0 $@;exit
// This comment line has been modified for Type I cloning purposes.

 var main = function ( ) { /* Main function definition starts here */
  
  // Declare a variable to hold the parsed input argument
  var arg ;

  // Loop indefinitely until an argument's first element is falsy (e.g., 0)
  for ( ; ( arg = readline ( ).split ( ' ' ).map ( Number ) ) [ 0 ] ; ) {
  
    // Extract numerical values from the argument array
    var a = arg [ 0 ] , b = arg [ 1 ] ; // 'a' and 'b' are local to the loop scope

    // Print the result (in this case, always 0)
    print ( 0 ) ;

  } /* End of for loop */

 } ; /* End of main function definition */


/*
 ************************************************************************
 *                                                                      *
 *                        I/O UTILITY SECTION                           *
 *                                                                      *
 * These functions handle standard input/output operations,             *
 * adapting to different JavaScript execution environments (Node.js/V8).*
 *                                                                      *
 ************************************************************************
*/

if ( 1 ) { // This block is executed if the condition is truthy (always in this case)

  // Environment detection: Node.js specific implementation
  // This comment indicates the targeted environment.

  var print = function ( x ) { // Define the 'print' function for Node.js
    console . log ( x ) ; // Use console.log to output
  } ;

  // Define the 'readline' function for Node.js using an IIFE (Immediately Invoked Function Expression)
  var readline = ( function ( ) {
    
    var T = [ ] , // Array to store input lines
        cnt = 0 ; // Counter for retrieving lines

    var stdin = process . openStdin ( ) ; // Open standard input stream
    stdin . setEncoding ( 'utf8' ) ; // Set encoding for input data

    var input_fragment = "" ; // Buffer for incomplete lines

    // Event listener for incoming data on stdin
    stdin . on ( 'data' , function ( input ) {
      
      var ref = ( input_fragment + input ) . split ( "\n" ) ; // Concatenate buffer and new input, then split by newline
      input_fragment = ref . pop ( ) ; // The last element is an incomplete line or empty string, save it

      // Process complete lines
      for ( var i = 0 ; i < ref . length ; i ++ ) {
        if ( ref [ i ] == '' ) continue ; // Skip empty lines
        T . push ( ref [ i ] ) ; // Add non-empty lines to the buffer
      }
    } ) ;

    // Event listener for the 'end' of standard input
    stdin . on ( 'end' , function ( z ) { // 'z' parameter is typically undefined for 'end' event
      // Handle any remaining input fragment once input stream closes
      if ( input_fragment ) {
        var ref = ( input_fragment + "\n" ) . split ( "\n" ) ; // Add newline to ensure splitting
        input_fragment = ref . pop ( ) ; // Again, pop the last (possibly empty) element
        for ( var i = 0 ; i < ref . length ; i ++ ) {
          if ( ref [ i ] == '' ) continue ; // Skip empty lines
          T . push ( ref [ i ] ) ; // Add to buffer
        }
      }
      // The original code had main() commented out here.
      // This comment clarifies its original state. //main();
    } ) ;

    // Return the actual readline function
    return function ( ) {
      if ( T . length <= cnt ) // Check if there are more lines available
        return null ; // Return null if no more input
      return T [ cnt ++ ] ; // Return the next line and increment counter
    } ;

  } ) ( ) ; // End of readline IIFE

} else { // This block is for non-Node.js environments (e.g., V8 standalone)

  // This comment indicates the targeted environment. //v8

  main ( ) ; // Directly call main function in V8 environment

} /* End of conditional block */