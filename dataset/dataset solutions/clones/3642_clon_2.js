/*
 * This extension adds a custom padding method to the String prototype.
 * It allows prepending a character (or string) to achieve a desired total length.
 */
String.prototype.padWithZeros = function( desiredLength, paddingCharacter ) {
  let sourceText = this; // Store the original string in a new variable.

  // If no padding character is specified, default to '0'.
  if ( typeof paddingCharacter === 'undefined' ) {
    paddingCharacter = "0";
  }

  /*
   * Validate the length: if the current string's length is already greater
   * than the target padded length, it indicates an invalid operation.
   */
  if ( sourceText.length > paddingCharacter.length * desiredLength ) {
    throw new Error( `Length violation: original string '${ sourceText }' (length ${ sourceText.length }) ` +
                     `exceeds maximum padded length (${ paddingCharacter.length * desiredLength }).` );
  }

  // Generate the full padded string by repeating the padding character and then slicing it.
  return ( paddingCharacter.repeat( desiredLength ) + this ).slice( -1 * paddingCharacter.length * desiredLength );
};

/*
 * The primary function to process problem data and determine the minimum
 * number of questions to attempt to achieve a specific target score.
 *
 * @param {string} problemData - The raw input data as a string.
 * @returns {number} The fewest number of problems to solve.
 */
function ProcessInputData( problemData ) {
  // Break down the input string into an array of lines.
  problemData = problemData.split( "\n" );

  // Extract the first line, split it by space, and convert to numbers.
  let taskConfig = problemData.shift().split( " " ).map( val => ~~val );
  const difficultyCount = taskConfig[0]; /* Number of distinct difficulty levels. */
  const goalPoints = taskConfig[1] / 100; /* The required total score, scaled. */

  // Arrays to hold the number of problems and bonus points for each difficulty level.
  const questionCounts = [];
  const completionBonuses = [];

  // Populate the arrays by parsing subsequent input lines.
  for ( let levelIdx = 0; levelIdx < difficultyCount; levelIdx++ ) {
    let itemInfo = problemData.shift().split( " " ).map( val => ~~val );
    questionCounts.push( itemInfo[0] );       // Store problems per level.
    completionBonuses.push( itemInfo[1] / 100 ); // Store bonus points per level, scaled.
  }

  // Calculate the total number of possible ways to choose complete difficulty sets.
  const totalOptions = Math.pow( 2, difficultyCount );

  // This array will store the total number of problems solved for each valid scenario.
  const lowestSolvedCount = [];

  // Iterate through all possible combinations of fully solving difficulty levels.
  for ( let comboIdx = 0; comboIdx < totalOptions; comboIdx++ ) {
    // Convert the current combination index to its binary representation, padded.
    const selectedLevelsBinary = comboIdx.toString( 2 ).padWithZeros( difficultyCount );

    let currentScore = 0;     // Accumulated score for this combination.
    let problemsAttempted = 0; // Number of problems solved for this combination.

    // First pass: Calculate score and problems for levels chosen to be fully completed.
    for ( let levelIndex = 0; levelIndex < difficultyCount; levelIndex++ ) {
      if ( selectedLevelsBinary[levelIndex] === "1" ) { // If this level is fully completed.
        problemsAttempted += questionCounts[levelIndex];
        currentScore += questionCounts[levelIndex] * ( levelIndex + 1 ) + completionBonuses[levelIndex];
      }
    }

    // If the target score is already met or exceeded with full completions.
    if ( goalPoints <= currentScore ) {
      lowestSolvedCount.push( problemsAttempted ); // Record this valid solution.
      continue; // Move to the next combination.
    }

    // Second pass: If the target isn't met, try solving additional problems from uncompleted levels.
    // We iterate backwards from highest difficulty to lowest for potential optimization.
    for ( let levelIndex = difficultyCount - 1; levelIndex >= 0; levelIndex-- ) {
      if ( selectedLevelsBinary[levelIndex] === "1" ) { // Skip already fully completed levels.
        continue;
      }

      // Calculate how many problems from this specific level are needed.
      const requiredSubproblems = Math.floor( ( goalPoints - currentScore ) / ( levelIndex + 1 ) );

      // Check if solving these problems is feasible and worthwhile.
      if ( requiredSubproblems <= 0 || requiredSubproblems >= questionCounts[levelIndex] ) {
        continue; // Not enough problems needed, or too many required for this level.
      }

      // Record the total problems attempted if this scenario is valid.
      lowestSolvedCount.push( problemsAttempted + requiredSubproblems );
    }
  }

  // Return the absolute minimum number of problems found across all valid scenarios.
  return Math.min( ...lowestSolvedCount );
}

/*
 * This self-invoking function handles the execution environment:
 * it detects if it's running in Node.js (for competitive programming platforms)
 * or in a browser (for local testing/development).
 */
( ( inputSourceText, executionOutput, resultKind ) => {
  // Check if the 'require' function is available (typical in Node.js).
  if ( "undefined" !== typeof require ) {
    // Node.js environment: read from stdin, process, and output to console.
    console.log( ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) );
  } else {
    // Browser environment: simulate input/output for testing purposes.
    inputSourceText = inputSourceText.split( "\n" ).slice( 1, -1 ).join( "\n" ); // Clean up input.
    executionOutput = ( () => {
      try {
        return ProcessInputData( inputSourceText ); // Run the main logic.
      } catch ( errorInstance ) {
        return errorInstance.stack || errorInstance.message; // Capture error details.
      }
    } )();
    resultKind = typeof executionOutput; // Determine the data type of the result.

    // If the result isn't a string, convert it to JSON string representation.
    if ( "string" === resultKind || ( executionOutput = JSON.stringify( executionOutput ) ) );

    // Use a jQuery-like structure to display input, type, and output in the browser.
    $( "<form>" ).append( [
      [ 10, inputSourceText ], 0, [ 1, resultKind ], 0, [ 10, executionOutput ]
    ].map( ( displayItem ) => {
      return $( displayItem ? "<textarea>" : "<br>", displayItem && { rows: displayItem[0], cols: 40, text: displayItem[1] } );
    } ) ).appendTo( "body" );
  }
} )( `
2 700
3 500
5 800
` );