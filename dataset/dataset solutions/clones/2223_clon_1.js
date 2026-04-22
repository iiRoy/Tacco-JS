"use strict"; /* This directive enables strict mode, which enforces stricter parsing and error handling. */


function main( arg )
{
  // Extract the first number from the input string, which is expected to be 'N'.
  var N = arg.split( "\n" )[ 0 ].split( " " ).map( Number )[ 0 ];

  // Calculate the number of digits in N, storing it in K.
  var K = String( N ).split( "" ).length;

  var count = 0; // Initialize a counter variable to keep track of certain conditions.


  // Loop through numbers from 1 up to N (exclusive).
  for ( var i = 1; i < N; i++ )
  {
    // Obtain the first and last digits of the current number 'i'.
    var row = get_tip( i );

    // The following lines were previously used for debugging purposes and are now removed:
    // if (row[1] === 0) continue;
    // console.log(row);

    // Determine the number of digits in the current number 'i'.
    var L = String( i ).split( "" ).length;

    // Inner loop, iterating from 1 up to K (number of digits in N).
    for ( var j = 1; j <= K; j++ )
    {
      // This block handles cases where the left-hand side number 'i' is a single digit.
      if ( L === 1 )
      {
        // If the right-hand side is also a single digit.
        if ( j === 1 )
        {
          count++; // Increment the counter.
          // console.log( [ i, i ] ); // Debugging line, now removed.
        }

        // If the right-hand side is a two-digit number, and the first and last digits of 'i' match.
        if ( j === 2 && row[ 0 ] === row[ 1 ] )
        {
          count++; // Increment the counter.
          // console.log( [ i, i + "" + i ] ); // Debugging line, now removed.
        }

        // If the right-hand side has more than two digits, and the first and last digits of 'i' match.
        if ( j > 2 && row[ 0 ] === row[ 1 ] )
        {
          // Loop to construct numbers of the form 'i_k_i'.
          for ( var k = 0; ; k++ )
          {
            var x = Number( "" + i + k + i ); // Construct the number 'i' concatenated with 'k' then 'i' again.
            if ( x > N ) break;              // Exit loop if the constructed number exceeds N.
            // console.log( [ i, x ] );         // Debugging line, now removed.
            count++;                         // Increment the counter.
          }
        }
      }

      // This block handles cases where the left-hand side number 'i' has multiple digits.
      if ( L > 1 )
      {
        // If the right-hand side is a single digit.
        if ( j === 1 )
        {
          if ( row[ 0 ] === row[ 1 ] ) // Check if the first and last digits of 'i' are identical.
          {
            // console.log( [ i, "--", row[ 0 ] ] ); // Debugging line, now removed.
            count++; // Increment the counter.
          }
        }

        // If the right-hand side is a two-digit number.
        if ( j === 2 )
        {
          if ( row[ 0 ] === row[ 1 ] ) // Check if the first and last digits of 'i' are identical.
          {
            // console.log( [ i, "--", row[ 1 ] + "" + row[ 0 ] ] ); // Debugging line, now removed.
            count++; // Increment the counter.
          }
        }

        // If the right-hand side has more than two digits.
        if ( j > 2 )
        {
          // Loop to construct numbers of the form 'lastDigit_k_firstDigit'.
          for ( var k = 0; ; k++ )
          {
            var x = Number( "" + row[ 1 ] + k + row[ 0 ] ); // Construct the number using last digit, k, then first digit.
            if ( x > N ) break;                              // Exit loop if the constructed number exceeds N.
            // console.log( [ i, x ] );                         // Debugging line, now removed.
            count++;                                         // Increment the counter.
          }
        }
        // Another block of commented-out debugging code, now removed:
        // if (j === 2 && row[0] === row[1]) {
        //     console.log([i,i])
        //     count++;
        // }
      }
    }
  }

  console.log( count ); // Output the final calculated count to the console.
}


// Read input from standard input and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );


/*
 * Helper function: get_tip
 * This function extracts the first and last digits of a given number.
 *
 * @param {number} a - The input number.
 * @returns {Array<number>} An array containing two numbers: [firstDigit, lastDigit].
 *                          If the input number is single-digit, it returns [digit, digit].
 */
function get_tip( a )
{
  var a_str = String( a ); // Convert the input number to a string for digit access.
  var x = a_str.length;    // Get the length of the string (number of digits).

  // If the number 'a' has only one digit.
  if ( x === 1 )
  {
    return [ a_str, a_str ].map( Number ); // Return an array with the single digit repeated.
  }

  // If the number 'a' has more than one digit.
  if ( x > 1 )
  {
    return [ a_str[ 0 ], a_str[ x - 1 ] ].map( Number ); // Return an array with the first and last digits.
  }
}