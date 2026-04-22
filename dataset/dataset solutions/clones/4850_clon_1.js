/*
 * This is the main application entry point.
 * It processes the input data and computes a result.
 */
function Main(  inputData  ) {

    // Initialize the input processing system with the provided data.
    init( inputData );

    // Read the first integer from the input stream.
    var   a   =   inI();
    // Read the second integer from the input stream.
    var   b   =   inI();


    // Calculate (a * b) / (a + b) and format the result to 10 decimal places.
    // Then, print the result to the console, followed by a newline.
    outln(   (   (   a   *   b   )   /   (   a   +   b   )   )   .   toFixed(   10   )   )   ;

} // End of Main function definition.


////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables for managing input data.
// 'input' will store the parsed input values.
// 'inputCnt' will track the current position in the 'input' array.
var input,      inputCnt;


/**
 * Debugging function.
 * This function is typically called when a "Run" or "Execute" button is pressed in a development environment.
 * It retrieves input from a specific HTML element and passes it to the Main function.
 * @returns {void}
 */
function debug(  )   {
    Main(   document.getElementById(   "input"   )   .   value   )   ;
}


/*
 * Initializes the input processing system.
 * It takes a raw string of input data, replaces newlines with spaces,
 * splits the string into an array of individual values, and resets the counter.
 *
 * @param {string} inputData - The raw string containing all input.
 * @returns {void}
 */
function init(  inputData  )   {
    // Replace all newline characters with a single space.
    input   =   inputData.replace(   /\n/g   ,   " "   )   ;
    // Split the modified string into an array of strings based on spaces.
    input   =   input.split(   " "   )   ;
    // Reset the input counter to the beginning of the array.
    inputCnt   =   0   ;
}


// --- Output functions ---
// 'out' function: Prints the provided output to the console without a trailing newline.
const out   =   (   output   )   =>   {   console.log(   output   )   }   ;
// 'outln' function: Prints the provided output to the console, followed by a newline character.
const outln   =   (   output   )   =>   {   console.log(   output   +   "\n"   )   }   ;


// --- Input functions ---
// 'inS' function: Reads the next string token from the input array.
const inS   =   (   )   =>   {   return   input[   inputCnt   ++   ]   }   ;
// 'inI' function: Reads the next string token and parses it as an integer (base 10).
const inI   =   (   )   =>   {   return   parseInt(   inS(   )   ,   10   )   }   ;
// 'inF' function: Reads the next string token and parses it as a floating-point number.
const inF   =   (   )   =>   {   return   parseFloat(   inS(   )   )   }   ;


// ************************************************************************************************
// * DO NOT EDIT BELOW THIS LINE. This section handles standard input/output for execution.     *
// * It reads all input from /dev/stdin and passes it to the Main function.                     *
// ************************************************************************************************
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;