/*
 * This file contains a JavaScript implementation for
 * adding two very large numbers represented as strings.
 * It processes input from standard input, expecting
 * the number of test cases followed by pairs of numbers.
 */

function bigAdd ( A , B )
{
  // Declare all necessary variables at the beginning for clarity.
  var m, n, mn, i, j, carry, tmp; // Loop counters, temporary storage, and carry
  var buf, a1, a2;                 // Buffer for result, array representations of input numbers


  // Determine which number is longer and assign them to a1 (longer) and a2 (shorter).
  // This simplifies the initial addition loop.
  if ( A.length > B.length )
  {
    m = A.length;
    n = B.length;
    a1 = A.split ( "" );
    a2 = B.split ( "" );
  }
  else
  {
    m = B.length;
    n = A.length;
    a1 = B.split ( "" );
    a2 = A.split ( "" );
  }

  // Basic overflow check: if the longer number is already too big,
  // we cannot guarantee a correct addition result and report an overflow.
  if ( m > 80 )
  {
    console.log ( "overflow" );
    return;
  }

  // Initialize the result buffer. It needs to be one digit longer than the
  // longest input number to accommodate a potential carry-out.
  mn = m + 1;
  buf = new Array ( mn );

  // Perform addition from right to left (least significant digit to most significant).
  // This loop handles the part where both numbers still have digits.
  for ( j = m - 1, i = n - 1, carry = 0 ; i >= 0 ; --i , --j )
  {
    // Convert characters to integers, add them along with the carry.
    tmp = parseInt ( a1[j] ) + parseInt ( a2[i] ) + carry;

    // Store the last digit of the sum in the buffer.
    buf[j + 1] = tmp % 10;

    // Calculate the new carry for the next iteration.
    carry = parseInt ( tmp / 10 );
  }

  /*
   * Handle remaining digits in the longer number (a1)
   * after the shorter number (a2) has been fully processed.
   * Continue adding with any remaining carry.
   */
  for ( ; j >= 0 ; --j )
  {
    tmp = parseInt ( a1[j] ) + carry;
    buf[j + 1] = tmp % 10;
    carry = parseInt ( tmp / 10 );
  }

  // The final carry, if any, goes into the first position of the buffer.
  buf[0] = carry;


  // Output the result.
  if ( carry > 0 )
  {
    // If there's a carry-out and the original longest number was at the limit,
    // it means the result has overflowed.
    if ( m == 80 )
    {
      console.log ( "overflow" );
    }
    else
    {
      // Otherwise, print the entire buffer, including the carry-out digit.
      console.log ( buf.join ( "" ) );
    }
  }
  else
  {
    // If there's no carry-out, the first digit of the buffer is 0,
    // so we slice it off before joining and printing.
    console.log ( buf.slice ( 1 , mn ).join ( "" ) );
  }
} // End of bigAdd function


// --- Input Processing Section ---

// Resume standard input to listen for data.
process.stdin.resume();

// Set the encoding for standard input.
process.stdin.setEncoding ( 'utf8' );

// Attach an event listener for incoming data.
process.stdin.on ( 'data' , function ( input )
{
  // Trim whitespace and split the input string by newlines to get an array of lines.
  var line = input.trim ( ).split ( "\n" );

  // Initialize line index.
  var i = 0;

  // Parse the first line as the number of test cases.
  var N = parseInt ( line[i++].trim ( ) );

  // Process each test case.
  {
    for ( ; N > 0 ; --N )
    {
      // Call bigAdd with the current pair of numbers from the input lines.
      bigAdd ( line[i] , line[i+1] );

      // Move to the next pair of numbers in the input.
      i = i + 2;
    }
  }
} );