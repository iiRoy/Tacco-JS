// This script processes standard input to find "hit" and "blow" counts
// based on a comparison logic. It's a common game-like problem.

// Import the Node.js 'fs' (file system) module for input handling.
var fs = require('fs')
  , // Define 'fs' and then declare other variables in a chain.
    length = fs.fstatSync(process.stdin.fd).size
  , // Get the size of the standard input stream.
    buffer = new Buffer(length)
  , // Create a buffer to hold the input data.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , // Read the input from stdin into the buffer.
    // Convert the buffer content to a UTF-8 string, trim whitespace,
    // and split it into an array of lines.
    input = buffer.toString('utf8', 0, bytesRead)
                  .trim()
                  .split('\n')
; // End of variable declarations.

// Immediately invoke the main processing function.
main ( ) ;


/**
 * @function main
 * @description The primary function that orchestrates the input processing
 *              and calculation of 'hit' and 'blow' values.
 *              It iterates through the input array, processing two lines at a time.
 */
function main ( )
{
    // Loop through the input array, incrementing by 2 each time
    // to process pairs of lines (e.g., a guess and a secret).
    for ( var i = 0 ,
              len = input . length ;
          i < len ;
          i += 2
        )
    {
        // Initialize 'hit' and 'brow' (blow) counters for the current pair.
        var hit  =  0
          , brow =  0
        ;

        // Parse the first line of the pair: trim and split by spaces.
        var a = input [ i ] . trim ( ) . split ( ' ' ) ;

        // Parse the second line of the pair: trim and split by spaces.
        var b = input [ i + 1 ] . trim ( ) . split ( ' ' ) ;


        // Iterate through the elements of array 'a' (the guess).
        for ( var j = 0 ,
                  lenj = a . length ;
              j < lenj ;
              j ++
            )
        {
            // Check for a 'hit': if elements at the same position match.
            if ( a [ j ]  ==  b [ j ] )
                hit ++ ; // Increment hit counter.

            // Check for a 'brow' (blow): if an element from 'a' matches
            // any other element in 'b' at a different position.
            for ( var k = j + 1 ,
                      lenk = a . length ;
                  k < lenk ;
                  k ++
                )
            {
                if ( a [ j ]  ==  b [ k ] )
                    brow ++ ; // Increment brow counter.
            }
        }

        // Output the calculated hit and brow counts for the current pair.
        console . log ( hit , brow ) ;
    }
}