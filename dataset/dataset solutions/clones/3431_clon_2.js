/* This function recursively counts numbers up to a given limit 'upperBoundary'
 * that contain the digits 3, 5, and 7, and are formed by specific rules. */
function calculateSpecialNumbers( digitPosition, currentNumber, upperLimit, totalCount )
{
  // If the current number exceeds the specified upper limit,
  // we've gone too far, so return the accumulated count.
  if ( currentNumber > upperLimit )
  {
    return totalCount;
  }

  // A boolean array to track the presence of digits 3, 5, and 7
  // within the 'tempNumber'.
  let digitPresenceFlags = new Array(10);

  // A temporary variable to process 'currentNumber' digit by digit.
  let tempNumber = currentNumber;

  // Iterate through the digits of 'tempNumber' from right to left.
  while ( tempNumber > 0 )
  {
    /* Check the last digit of 'tempNumber' using the modulo operator. */
    switch ( tempNumber % 10 )
    {
      // If the digit is 3, mark its presence.
      case 3:
      {
        digitPresenceFlags[3] = true;
        break;
      }
      // If the digit is 5, mark its presence.
      case 5:
      {
        digitPresenceFlags[5] = true;
        break;
      }
      // If the digit is 7, mark its presence.
      case 7:
      {
        digitPresenceFlags[7] = true;
        break;
      }
      // For any other digit, do nothing specific.
      default:
      {
        break;
      }
    }
    // Remove the last digit from 'tempNumber' for the next iteration.
    tempNumber = Math.floor( tempNumber / 10 );
  }

  // If the current number contains all three required digits (3, 5, 7),
  // increment the total count.
  totalCount += ( digitPresenceFlags[3] === true && digitPresenceFlags[5] === true && digitPresenceFlags[7] === true ) ? 1 : 0;

  // Recursive calls to explore numbers formed by appending 3, 5, or 7
  // at the current digit position.
  totalCount += calculateSpecialNumbers( ( digitPosition + 1 ), ( Math.pow(10, digitPosition) * 3 + currentNumber ), upperLimit, 0 );
  totalCount += calculateSpecialNumbers( ( digitPosition + 1 ), ( Math.pow(10, digitPosition) * 5 + currentNumber ), upperLimit, 0 );
  totalCount += calculateSpecialNumbers( ( digitPosition + 1 ), ( Math.pow(10, digitPosition) * 7 + currentNumber ), upperLimit, 0 );

  // Return the accumulated count for this branch of recursion.
  return totalCount;
}

/**
 * Main entry point for the program.
 * Processes the raw input and orchestrates the counting process.
 * @param {string} rawData - The raw input string, expected to be a number.
 */
function ExecuteProgram ( rawData )
{
  // Parse the input string into an integer, which serves as the upper boundary.
  let parsedLimit = parseInt( rawData );

  // Initialize the final result accumulator.
  let finalResult = 0;

  // Initiate the recursive counting for numbers starting with 3, 5, and 7.
  finalResult += calculateSpecialNumbers( 1, 3, parsedLimit, 0 );
  finalResult += calculateSpecialNumbers( 1, 5, parsedLimit, 0 );
  finalResult += calculateSpecialNumbers( 1, 7, parsedLimit, 0 );

  // Output the computed total count to the console.
  console.log( finalResult );
}

// Do not modify the following line; it handles input reading and function invocation.
ExecuteProgram( require("fs").readFileSync("/dev/stdin", "utf8") );