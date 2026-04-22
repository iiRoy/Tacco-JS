/*
 * This script processes input lines to calculate a specific value.
 * It reads numbers from standard input and performs power calculations.
 */

  var lines = [ ] ; // Array to store input lines
  var result = 0 ; // Placeholder, not used in the original logic, but kept as is.

var readline = require ( 'readline' ) ; // Import the readline module for interactive input.


var rl = readline.createInterface (
  {
    input  : process.stdin , // Standard input stream.
    output : process.stdout // Standard output stream.
  }
) ;


rl.on (
  'line' ,
  function ( x )
  { // Event listener for each line of input received.

    lines.push ( x ) ; // Add the received line to the 'lines' array.

  }
) ;


rl.on (
  'close' ,
  function ( )
  { // Event listener for when the input stream closes.

    // Parse the first line of input as the target number X.
    var X = Number ( lines [ 0 ] ) ;

    // Initialize 'ans' variable, which will store the largest power of 'i' less than or equal to X.
    // Note: 'ans' is implicitly global here as it's not declared with 'var', 'let', or 'const'.
    ans = 0;

    // Loop through numbers starting from 1 up to X.
    for (
      var i = 1 ;
      i <= X ;
      i++
    )
    {
      // Check for powers from 10 down to 2.
      // The assignment happens to 'ans' if the power of 'i' is less than or equal to X.
      // Due to the order, the last condition met will determine the value of 'ans'.
      // This logic seems to prioritize higher powers if they are valid, but the variable `ans`
      // is overwritten by smaller powers if they are also valid. This is exactly as in the original.

      if ( Math.pow ( i , 10 ) <= X ) { ans = Math.pow ( i , 10 ) } // Check i^10
      if ( Math.pow ( i , 9 ) <= X )  { ans = Math.pow ( i , 9 )  } // Check i^9
      if ( Math.pow ( i , 8 ) <= X )  { ans = Math.pow ( i , 8 )  } // Check i^8
      if ( Math.pow ( i , 7 ) <= X )  { ans = Math.pow ( i , 7 )  } // Check i^7
      if ( Math.pow ( i , 6 ) <= X )  { ans = Math.pow ( i , 6 )  } // Check i^6
      if ( Math.pow ( i , 5 ) <= X )  { ans = Math.pow ( i , 5 )  } // Check i^5
      if ( Math.pow ( i , 4 ) <= X )  { ans = Math.pow ( i , 4 )  } // Check i^4
      if ( Math.pow ( i , 3 ) <= X )  { ans = Math.pow ( i , 3 )  } // Check i^3
      if ( Math.pow ( i , 2 ) <= X )  { ans = Math.pow ( i , 2 )  } // Check i^2
    }


    // Output the final calculated answer to the console.
    console.log ( ans ) ;
  }
) ;