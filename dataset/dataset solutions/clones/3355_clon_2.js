function ProcessData ( rawDataLines ) {

  // Split the entire input string into individual lines
  rawDataLines = rawDataLines.split( "\n" );

  // Parse the first line to get the total number of elements
  var itemCount = Number.rawDataLines[ 0 ] );

  // Extract and convert the heights array from the second line
  var heightArray = rawDataLines[ 1 ].split( " " ).map( ( elem ) => {
    return Number( elem );
  } );

  // Extract and convert the values array from the third line
  var valueArray = rawDataLines[ 2 ].split( " " ).map( ( elem ) => Number( elem ) );

  // Initialize a dynamic programming array with zeros. Its size is itemCount + 1.
  var dynamicProgram = new Array( itemCount + 1 ).fill( 0 );

  // This line was commented out in the original, so it remains commented.
  // dynamicProgram[heightArray[0]] = valueArray[0];

  // Variable to store the ultimate calculated outcome
  var finalOutcome = 0;

  // Iterate through each item from 0 up to itemCount - 1
  for ( var outerIndex = 0 ; outerIndex < itemCount ; outerIndex++ ) {
    // This variable was declared but unused in the original code.
    var tempMax = 0;

    // Calculate the current potential sum: value at current index + DP value at corresponding height
    var currentSum = valueArray[ outerIndex ] + dynamicProgram[ heightArray[ outerIndex ] ];

    // Inner loop: propagate the current sum to subsequent DP entries
    for ( var innerIndex = heightArray[ outerIndex ] ; innerIndex < itemCount + 1 ; innerIndex++ ) {
      // If the calculated sum is greater than the existing DP value, update it
      if ( currentSum > dynamicProgram[ innerIndex ] ) {
        dynamicProgram[ innerIndex ] = currentSum;
      } else {
        // If not greater, we can break as further values won't be updated (assuming non-decreasing DP values)
        break;
      }
    }
    // Update the overall maximum outcome found so far
    finalOutcome = Math.max( finalOutcome , dynamicProgram[ heightArray[ outerIndex ] ] );
  }

  // Output the final result to the standard console stream
  console.log( '%s' , finalOutcome );
  // Return the final result of the computation
  return finalOutcome;
}

// Function designed for local testing and debugging purposes
// It simulates fetching input from HTML elements
function validateExecution ( testId ) {
  // Retrieve the input data for the specific test case
  var testCaseInput = document.getElementById( "dataInput" + testId ).value;
  // Execute the main processing function with the test input
  var computedResult = ProcessData( testCaseInput );
  // Initialize the status of the test case
  var testStatus = "WrongAnswer";

  // Compare the computed result with the expected output from an HTML element
  if ( computedResult === Number( document.getElementById( "expectedOutput" + testId ).value.split( "\n" )[ 0 ] ) ) {
    testStatus = "Accepted"; // Mark as accepted if they match
  }
  // Display the test status in the designated result element
  document.getElementById( "testResult" + testId ).innerHTML = testStatus;
}

// Execute the primary function by reading input from standard input stream
ProcessData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );