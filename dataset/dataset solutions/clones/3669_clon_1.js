function myin()
{
  // This function reads input from standard input.
  // It uses the 'fs' module to read the file at "/dev/stdin".
  // The content is read as UTF-8 and then trimmed of leading/trailing whitespace.
  return require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim( );
}

function myout( t )
{
  // This function is for standard output.
  // It prints the provided argument 't' to the console.
  console.log( t );
}

// Helper function for converting input data based on a specified type.
// The 'no' parameter determines the conversion method.

// [Conversion Parameters]
// 0: No conversion; returns the input as is.
// 1: Converts input to an integer using parseInt().
// 2: Splits the input string by a single space (" ").
// 3: Splits the input string by a newline character ("\n").
// 4: Splits by space, then maps each part to a Number (resulting in a number array).
// 5: Splits by newline, then maps each part to a Number (resulting in a number array).
// 6: Splits the input into individual characters (resulting in a string array).
// 7: Splits into individual characters, then maps each to a Number (resulting in a number array).
function myconv( i , no )
{
  switch( no )
  {
    case 0 :
      // Case 0: No conversion, return original input.
      return i;

    case 1 :
      // Case 1: Convert to integer.
      return parseInt( i );

    case 2 :
      // Case 2: Split by space.
      return i.split( " " );

    case 3 :
      // Case 3: Split by newline.
      return i.split( "\n" );

    case 4 :
      // Case 4: Split by space, then convert each part to a number.
      return i.split( " " ).map( ( a ) => Number( a ) );

    case 5 :
      // Case 5: Split by newline, then convert each part to a number.
      return i.split( "\n" ).map( ( a ) => Number( a ) );

    case 6 :
      // Case 6: Split into individual characters.
      return i.split( "" );

    case 7 :
      // Case 7: Split into characters, then convert each to a number.
      return i.split( "" ).map( ( a ) => Number( a ) );
  }
}

/**
 * Main function to process the input and solve the problem.
 * @param {string} input - The raw input string read from stdin.
 */
function Main( input )
{
  // Convert the multiline input string into an array of strings, split by newline.
  input = myconv( input , 3 );

  // Remove the first line of input, often a count or header.
  input.shift( );

  // Initialize an array to store the results for each test case.
  var output = [];

  // Iterate through each line of the remaining input, which represents a test case.
  for ( var i = 0 ; i < input.length ; i++ )
  {
    // Parse the current line of input into four numerical parameters.
    // a: Initial stock quantity.
    // b: Quantity Snuke buys.
    // c: Threshold for stock replenishment.
    // d: Quantity added to stock if it falls below the threshold.
    var a       = myconv( input[ i ] , 4 )[ 0 ];
    var initA   = myconv( input[ i ] , 4 )[ 0 ]; // Store initial 'a' for cycle detection.
    var b       = myconv( input[ i ] , 4 )[ 1 ];
    var c       = myconv( input[ i ] , 4 )[ 2 ];
    var d       = myconv( input[ i ] , 4 )[ 3 ];

    // Flag to indicate if Snuke cannot buy 'b' items.
    var noFlag = false;
    // Counter to track the number of days (iterations).
    var count = 0;

    // Simulation loop to model the stock changes day by day.
    while ( true )
    {
      count++; // Increment day counter.

      // Check if current stock 'a' is less than 'b' (Snuke's purchase quantity).
      if ( a < b )
      {
        noFlag = true; // Snuke cannot buy 'b' items.
        break;         // Exit the loop as the condition is met.
      }

      // Calculate remaining stock after Snuke buys 'b' items repeatedly
      // until 'a' is less than 'b'. This is equivalent to 'a % b'.
      a = a % b;

      // Check if the remaining stock 'a' is at or below the threshold 'c'.
      if ( a <= c )
      {
        a += d; // Replenish stock by 'd' units.
      }

      // Check for two conditions to break the loop:
      // 1. If stock 'a' returns to its initial value 'initA', indicating a cycle.
      // 2. If the simulation runs for too many days (10,000,000), preventing infinite loops.
      if ( a == initA || count >= 10000000 )
      {
        break; // Exit the loop due to cycle detection or excessive iterations.
      }
    }

    // Based on the 'noFlag', determine the output for the current test case.
    if ( noFlag )
    {
      output.push( "No" ); // If Snuke couldn't buy, add "No".
    }
    else
    {
      output.push( "Yes" ); // Otherwise, Snuke could always buy, add "Yes".
    }
  }

  // Join all individual test case results with newlines and print to standard output.
  myout( output.join( "\n" ) );
}

// Invoke the Main function with input read from standard input.
Main( myin( ) );