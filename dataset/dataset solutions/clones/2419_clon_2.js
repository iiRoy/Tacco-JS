"use strict"; /* This directive ensures strict mode for the script. */


// A utility function to generate a multi-dimensional array dynamically.
function constructNestedArray( initialValue )
{
  // Access all arguments passed to this function.
  var argumentList = arguments;
  // Get the total number of dimensions from the arguments.
  var totalDimensions = argumentList.length;
  // Build the innermost array creation string.
  var creationString = `Array(argumentList[${--totalDimensions}]).fill(0).map( _ => {return ${initialValue};})`;

  // Loop to wrap the array creation for higher dimensions.
  while ( --totalDimensions ) {
    creationString = `Array(argumentList[${totalDimensions}]).fill(0).map( _ => ${creationString} )`;
  }
  // Evaluate the constructed string to create the array.
  return eval( creationString );
}


// A mapping to toggle between two states (e.g., colors or states).
var colorSwitcher = { "R": "B", "B": "R" };

// Initialize the readline interface for standard input/output operations.
const inputReader = require("readline").createInterface( process.stdin, process.stdout );

// The main asynchronous generator function for the problem solving logic.
const solverProcess = ( function* () {

  // Helper function to read a single line from input.
  const readNextLine = () => inputReader.once("line", ( inputString ) => solverProcess.next( inputString ) );

  // Array to store the final computed solution.
  var finalResult = [];
  // Variable to hold the problem's primary dimension size.
  var dimensionSize = yield readNextLine();
  // Ensure dimensionSize is treated as a number.
  dimensionSize = Number( dimensionSize );
  // Calculate double the primary dimension.
  var doubleDimension = 2 * dimensionSize;
  // Array to hold the current pattern of indices for queries.
  var queryIndices = [];

  // Populate the initial query pattern with sequential numbers.
  for ( var counter = 1; counter <= dimensionSize; counter++ )
  {
    queryIndices[ counter - 1 ] = counter;
  }

  // Output the first query to the interactive judge.
  console.log( "?", queryIndices.join(" ") );
  // Await the response from the judge for the first query.
  var firstQueryOutput = yield readNextLine();

  // Variables for binary search-like logic.
  var lowerBound = 1, upperBound = dimensionSize + 1, midPoint;

  // Perform a search to find a critical value.
  while ( upperBound - lowerBound > 1 )
  {
    // Calculate the midpoint using bitwise right shift for integer division.
    midPoint = ( upperBound + lowerBound + 1 ) >> 1;
    // Update the query pattern based on the current midpoint.
    for ( var counter = 0; counter < dimensionSize; counter++ )
    {
      queryIndices[ counter ] = midPoint + counter;
    }
    // Output the current query pattern.
    console.log( "?", queryIndices.join(" ") );
    // Await the response from the judge.
    var queryFeedback = yield readNextLine();

    // Adjust bounds based on the comparison of responses.
    if ( firstQueryOutput[0] !== queryFeedback[0] )
    {
      upperBound = midPoint;
    }
    else
    {
      lowerBound = midPoint;
    }
  }

  // Assign the determined critical value.
  midPoint = upperBound;

  // Populate parts of the final result array based on the critical value and initial response.
  finalResult[ midPoint - 2 ] = firstQueryOutput[0];
  finalResult[ midPoint - 2 + dimensionSize ] = colorSwitcher[ firstQueryOutput[0] ];

  // Array for a secondary pattern of indices.
  var complementaryIndices = [];
  // Set to keep track of indices included in the first pattern.
  var includedElements = new Set();

  // Generate the initial part of the secondary pattern and track included elements.
  for ( var counter = 0; counter < dimensionSize - 1; counter++ )
  {
    queryIndices[ counter ] = ( midPoint + counter ) % doubleDimension;
    complementaryIndices[ counter ] = ( queryIndices[ counter ] + dimensionSize - 1 ) % doubleDimension + 1;
    includedElements.add( queryIndices[ counter ] );
  }

  // Iterate through all possible indices to fill the remaining parts of the solution.
  for ( var counter = 1; counter <= doubleDimension; counter++ )
  {
    // Skip if the current index already has a determined value in the result.
    if ( finalResult[ counter - 1 ] ) {
      continue;
    }

    // Check if the current index is part of the 'includedElements' set.
    if ( includedElements.has( counter ) )
    {
      // If so, use the complementary pattern for the query.
      complementaryIndices[ dimensionSize - 1 ] = counter;
      console.log( "?", complementaryIndices.join(" ") );
      var queryFeedback = yield readNextLine();
      // Assign the result based on the query feedback.
      if ( queryFeedback[0] === "R" ) {
        finalResult[ counter - 1 ] = "R";
      } else {
        finalResult[ counter - 1 ] = "B";
      }
    }
    else
    {
      // Otherwise, use the primary pattern for the query.
      queryIndices[ dimensionSize - 1 ] = counter;
      console.log( "?", queryIndices.join(" ") );
      var queryFeedback = yield readNextLine();
      // Assign the result based on the query feedback.
      if ( queryFeedback[0] === "R" ) {
        finalResult[ counter - 1 ] = "R";
      } else {
        finalResult[ counter - 1 ] = "B";
      }
    }
  }

  // Output the final computed solution.
  console.log( "!", finalResult.join("") );

} )(); // Immediately invoke the generator function.

// Start the generator to begin processing.
solverProcess.next();