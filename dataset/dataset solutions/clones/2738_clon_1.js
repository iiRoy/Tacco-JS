// This section handles the input/output setup and provides utility functions.
// It's generally boilerplate for competitive programming contexts.
var read = require('readline').createInterface(  {
  input: process.stdin
  ,
  output: process.stdout
} );

var obj
; // This variable will store the initialized input object.
var inLine = [ ] ; // Array to hold all input lines.

// Event listener: when a line of input is received, push it to inLine.
read.on( 'line', function(input) {
  inLine.push(input);
} ) ;

// Event listener: when the input stream closes, process the input.
read.on('close', function(  )
{
    obj = init(inLine); // Initialize the custom input reader with all collected lines.

    console.error( "\n" )
    ; // Print a blank line to standard error for better output readability.

    var start = new Date(); // Capture the start time for performance measurement.

    Main( ) ; // Execute the main logic of the program.

    var end = new Date() - start; // Calculate the elapsed time in milliseconds.

    myerr("time : " + (end) + "ms"); // Output the execution time to standard error.
    myerr( "memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB" ) ; // Output memory usage to standard error.
} );


// Helper function to create a deep clone of an object.
function makeClone( obj )
{
  return JSON.parse(JSON.stringify(obj));
}

// Function to read the next input token and convert it to an integer.
function nextInt( )
{
  return myconv( next(),1 ) ;
}

// Function to read the next input token and convert it to a string array (split by space).
function nextStrArray(  )
{
  return myconv( next() , 2 ) ;
}

// Function to read the next input token and convert it to an integer array (split by space).
function nextIntArray(  )
{
  return myconv( next() , 4 ) ;
}

// Function to read the next input token and convert it to a character array.
function nextCharArray(  )
{
  return myconv( next() , 6 ) ;
}

// Function to get the next input token from the initialized input object.
function next(  )
{
  return obj.next( ) ;
}

// Function to check if there are more input tokens available.
function hasNext(  )
{
  return obj.hasNext( ) ;
}

// Initializes a custom input object with methods for sequential access.
function init( input )
{
  var returnObj =
  {
    list : input // Stores all input lines.
    ,
    index : 0 // Current position in the input list.
    ,
    max : input.length // Total number of input lines.
    ,
    // Method to check if there are more lines to read.
    hasNext : function( )
    {
      return ( this.index < this.max ) ;
    }
    ,
    // Method to get the next line of input.
    next : function(  )
    {
      if ( !this.hasNext() )
      {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input.
      }
      else
      {
        var returnInput = this.list[this.index]; // Get the current line.
        this.index++; // Move to the next line.
        return returnInput; // Return the current line.
      }
    }
  } ;
  return returnObj;
}

// Custom output function, simply logs to console.
function myout( s )
{
  console.log(s);
}

// Custom error/debug logging function, inspects object structure.
function myerr( s )
{
  console.error( "debug:" + require("util").inspect(s,false,null) ) ;
}

// This function handles various type conversions based on the 'no' parameter.
// Parameter 'no' definitions:
//  - Any other value (default): Returns input 'i' as is.
//  - 1: Parses 'i' as an integer.
//  - 2: Splits string 'i' by spaces into an array of strings.
//  - 4: Splits string 'i' by spaces and maps each part to a Number.
//  - 6: Splits string 'i' into an array of individual characters.
//  - 7: Splits string 'i' into characters and maps each to a Number.
//  - 8: Joins array 'i' elements with a space.
//  - 9: Joins array 'i' elements with a newline character.
//  - 0: Joins array 'i' elements without any separator.
function myconv( i , no )
{
  try
  {
    switch( no )
    {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(Number);
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(Number);
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  }
  catch( e )
  {
    return i; // In case of conversion error, return the original input.
  }
}

// End of utility functions. The main program logic begins here.

function Main(  )
{
    // Read the first integer from input, which represents N.
    var N = nextInt(  )
    ;

    // Read the next line as an array of integers.
    var list = nextIntArray(  )
    ;

    // Initialize an array 'set' of size N with all elements set to zero.
    // This array will be used to mark certain indices.
    var set = new Array(N).fill(0)
    ;

    // Iterate through the indices from N-1 down to 0.
    // This loop processes elements in reverse order.
    for
    (
        var i = N - 1
        ;
        i >= 0
        ;
        i--
    )
    {
        // Calculate 'bai', which is (i + 1). This represents a ball number.
        var bai = i + 1
        ;

        var sum = 0
        ; // Initialize a sum for the current ball's multiples.

        // Inner loop: iterate through multiples of 'bai' up to N.
        for
        (
            var j = 1
            ;
            j * bai <= N
            ;
            j++
        )
        {
            // Calculate the 0-based index corresponding to the current multiple.
            var index = j * bai - 1
            ;

            // Add the value from 'set' at this index to the sum.
            sum += set[index]
            ;
        }

        // Check if the parity of 'sum' is different from the parity of 'list[i]'.
        if
        (
            sum % 2 != list[i] % 2
        )
        {
            // If parities are different, increment 'set[i]'.
            // This effectively flips the state for this ball if needed.
            set[i]++
            ;
        }
    }

    // Initialize an empty array to store the final output (indices of balls to toggle).
    var output = [ ]
    ;

    // Iterate through the 'set' array from beginning to end.
    for
    (
        var i = 0
        ;
        i < N
        ;
        i++
    )
    {
        // If 'set[i]' is 1, it means this ball needs to be toggled.
        if
        (
            set[i] == 1
        )
        {
            // Add (i + 1) to the output array (converting 0-based index to 1-based ball number).
            output.push(i + 1)
            ;
        }
    }

    // Output the total number of balls that need to be toggled.
    myout(output.length)
    ;

    // If there are any balls to toggle, output their numbers.
    if
    (
        output.length > 0
    )
    {
        // Use myconv(output, 8) to join the ball numbers with spaces.
        myout( myconv(output, 8) )
        ;
    }
}