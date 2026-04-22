function    Main (   input )  { // This is the main function that processes the input data

  input  =  input.split ( '\n' ) ; // Split the input string into an array of lines

  var T = input [ 0 ] . split ( ' ' ) ; // Extract first line for T values
  var A = input [ 1 ] . split ( ' ' ) ; // Extract second line for A values
  var B = input [ 2 ] . split ( ' ' ) ; // Extract third line for B values

  // Loop to convert string values to numbers for T, A, and B
  for ( var i = 0 ; i < 2 ; i++ ) {
    T [ i ] = Number ( T [ i ] ) ;
    A [ i ] = Number ( A [ i ] ) ;
    B [ i ] = Number ( B [ i ] ) ;
  }

  var sa = new Array ( 2 ) ; // Initialize an array 'sa' of size 2
  sa [ 0 ] = T [ 0 ] * A [ 0 ] - T [ 0 ] * B [ 0 ] ; // Calculate sa[0]
  sa [ 1 ] = T [ 1 ] * A [ 1 ] - T [ 1 ] * B [ 1 ] ; // Calculate sa[1]

  var x     =     0 ; // Initialize x to 0
  var xmae  =     1 ; // Initialize xmae (previous x) to 1
  var pm    =     0 ; // Unused variable, possibly a leftover

  var count = -1 ; // Initialize count to -1

  // Check for a specific condition related to sa values
  if ( sa [ 0 ] == sa [ 1 ] * -1 ) {
    console.log ( 'infinity' ) ; // If condition met, print 'infinity'
  } else {
    // This loop runs at most once due to the 'i=1' break
    for ( var i = 0 ; i < 1 ; i ) {
      count++ ; // Increment count
      xmae = x ; // Store current x in xmae
      x += sa [ count % 2 ] ; // Update x based on sa array and count parity

      // If x and xmae have the same sign (both positive or both negative)
      if ( x * xmae > 0 ) {
        i = 1 ; // Break the loop by setting i to 1
      }
    }
    console.log ( count - 1 ) ; // Print the final result
  }
}

// Call the Main function with input read from stdin
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;