// This script initializes standard input handling for a Node.js application.

// Resumes the standard input stream, making it ready to receive data.
process.stdin.resume(      );


// Sets the encoding for the standard input stream to 'utf8' to correctly interpret characters.
process.stdin.setEncoding(   'utf8'   );


// Declares a variable to store all incoming data from standard input.
let   inputData   =   ''   ;


// Attaches an event listener to the 'data' event of the standard input stream.
// This function is called whenever a chunk of data is received.
process.stdin.on(   'data',   inputStdin   =>   {
      // Appends the current chunk of input data to the 'inputData' string.
      inputData   +=   inputStdin   ;
}   );


// Attaches an event listener to the 'end' event of the standard input stream.
// This function is executed once all input has been received.
process.stdin.on(   'end',   _   =>   {
      // Removes any trailing whitespace from the accumulated input data.
      inputData   =   inputData.replace(   /\s*$/g,   ''   )
      ;


      // Splits the processed input string into an array of substrings, using a space as the delimiter.
      inputData   =   inputData.split(   ' '   )   ;


      // Calls the main function to begin the core logic of the application.
      main(   )   ;
}   );


// Defines the main function where the primary business logic resides.
function   main(   )   {
      // Calculates the product of all elements in the 'inputData' array using the reduce method.
      // Assumes 'inputData' contains numeric values that can be multiplied.
      let   result   =   inputData.reduce(   (   a,   b   )   =>   a   *   b   )   ;


      // Writes the final calculated result to the standard output, converting it to a string first.
      process.stdout.write(   result.toString(   )   )
}