/*
 * This script is designed to read input lines from standard input,
 * process these lines, and then output a computed result
 * to standard output. It demonstrates basic I/O operations
 * using Node.js streams and the 'readline' module.
 *
 * The problem it solves involves a mathematical calculation
 * based on numerical input provided by the user.
 */

// This line ensures that the standard input stream
// remains active and ready to receive data.
process  .  stdin  .  resume(  )  ;

// Sets the character encoding for the standard input stream
// to 'utf8', which is a common and robust encoding.
process  .  stdin  .  setEncoding(  'utf8'  )  ;


// A dynamically-sized array to accumulate all input lines
// as they are read from the standard input stream.
var    lines    =    [  ]    ;

// Initializes an interface for reading input line by line.
// This abstraction simplifies handling input streams.
var    reader    =    require(  'readline'  )  .  createInterface(  {
  input   :   process  .  stdin  ,  // Specifies standard input as the source.
  output  :   process  .  stdout   // Specifies standard output as the destination for readline's internal prompts (if any).
}  )    ;

// Attaches an event listener to the 'line' event of the reader.
// This function will be executed every time a complete line
// of input is received from the standard input.
reader  .  on(  'line'  ,  (  line  )  =>  {
  // Adds the newly read line to the 'lines' array.
  lines  .  push(  line  )  ;
}  )    ;


// Attaches an event listener to the 'close' event of the reader.
// This function is triggered when the input stream ends,
// signaling that all input has been received.
reader  .  on(  'close'  ,  (  )  =>  {
    // All input has been collected; now, the processing logic begins.

    // The first line of input is expected to be a number, N.
    const   N   =   lines[  0  ]  ;

    // The second line contains a space-separated list of numbers.
    // It is split into an array of strings, and then each string
    // is converted into a number using the `map(v=>v-0)` idiom.
    const   list   =   lines[  1  ]  .  split(  " "  )  .  map(  v=>v-0  )  ;

    // Counts the number of even integers within the 'list'.
    // The filter method selects elements where the modulo 2 result is 0.
    const   cnt   =   list  .  filter(  v=>v%2==0  )  .  length  ;

    // Performs the final calculation: (3 to the power of N) minus (2 to the power of cnt).
    // The result of this calculation is then printed to the console.
    console  .  log(  Math  .  pow(  3  ,N  )  -  Math  .  pow(  2  ,cnt  )  )  ;
}  )    ;

// The script finishes its setup phase here,
// waiting for input events to occur.