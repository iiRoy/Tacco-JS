/*
 * This file processes input from stdin to calculate a Euclidean distance.
 * It's a demonstration of a Type I code clone, showcasing variations
 * in whitespace and comments while preserving all code elements.
 */


// Declare a variable to store all incoming data chunks from standard input.
// Initially, it's an empty string.
var   input   =   '';


// Obtain a readable stream object specifically for the standard input.
var   readable   =   process.stdin;


// Resume the readable stream to ensure it starts emitting 'data' events.
readable.resume   (   );


// Set the character encoding for the input stream to 'utf-8'.
// This ensures correct interpretation of received bytes into characters.
readable.setEncoding   (   'utf-8'   );


// Attach an event listener for the 'data' event.
// This event fires whenever a chunk of data is available from the input stream.
readable.on   (   'data',

  // Define the anonymous callback function that will be executed for each 'data' chunk.
  function   (   chunk   )   {

    // Append the current data 'chunk' to the 'input' string.
    // This accumulates all incoming data until the stream ends.
    input   +=   chunk;

  }   );


// Attach an event listener for the 'end' event.
// This event signals that the input stream has finished sending data.
readable.on   (   'end',

  // Define the anonymous callback function to be executed once the input stream ends.
  function   (   )   {

    /*
     * When the entire input has been received, process it.
     * The input is expected to be a space-separated sequence of numbers.
     * First, split the accumulated 'input' string by spaces.
     * Then, use the 'map' method with the 'Number' constructor to convert each
     * resulting string segment into an actual number.
     * Store this array of numbers in the 'data' variable.
     */
    var   data   =   input.split   (   " "   ) .map   (   Number   );

    // Calculate the Euclidean distance between two points in a 2D plane.
    // The points are assumed to be (data[0], data[1]) and (data[2], data[3]).
    // The formula used is sqrt((x2-x1)^2 + (y2-y1)^2).
    var   d   =   Math.sqrt   (
      Math.pow   (   data[0]   -   data[2],   2   )   +   Math.pow   (   data[1]   -   data[3],   2   )
    );

    // Output the calculated distance 'd' to the standard output (console).
    console.log   (   d   );

  }   );

// End of the JavaScript script.
// All operations are handled asynchronously via event listeners.