/* This function serves as the initial setup routine, responsible for parsing and preparing the raw input data. */
function initializeData( rawInputContent )
{
  // The input is a single string; split it into an array of lines using the newline character as a delimiter.
  inputLines = rawInputContent.split( "\n" );

  // The first line of the input typically represents a count or size. Convert it to a number.
  // This variable is implicitly global, mirroring the original code's behavior for 'N'.
  lineCountValue = Number(inputLines[0]);

  /*
   * The second line contains space-separated values.
   * 1. Split this line by spaces to get an array of string-based numeric segments.
   * 2. Use the `map` function to transform each string segment into its actual numerical representation.
   * This resulting array, 'measurementsArray', will be implicitly global, accessible throughout the script.
   */
  measurementsArray = inputLines[1].split(" ").map(
    function( textSegment, positionIndex )
    {
      // Convert the current string segment to a floating-point number.
      return Number( textSegment );
    }
  );

  // Once the input data has been successfully prepared and parsed,
  // invoke the primary processing function to begin the main computation.
  executeMainLogic();
}

/*
 * This function encapsulates the core algorithm.
 * It iterates through the processed measurement data to calculate a specific result.
 * The logic here determines how many elements in a sequence are greater than or equal to
 * the maximum element observed up to their point in the sequence.
 */
function executeMainLogic()
{
  // Initialize a counter for the items that meet the specified condition.
  var validItemCounter = 0;

  // Initialize a variable to keep track of the highest value encountered during the iteration.
  var currentHighestValue = 0;

  // Iterate over each item in the globally available 'measurementsArray'.
  measurementsArray.forEach(
    function( dataPoint, loopIteration )
    {
      // Check if the current data point is greater than or equal to the highest value seen so far.
      if ( currentHighestValue <= dataPoint )
      {
        validItemCounter++; // If the condition is met, increment the counter.
        currentHighestValue = dataPoint; // Update the record for the highest value encountered.
      }
    }
  );

  // Finally, output the computed total count to the standard console.
  console.log( validItemCounter );
}

// This is the program's entry point.
// It uses Node.js's 'fs' module to synchronously read the entire content
// of the standard input stream ('/dev/stdin'), decodes it as UTF-8,
// and then passes this raw string data to the 'initializeData' function.
initializeData( require("fs").readFileSync( "/dev/stdin", "utf8" ) );