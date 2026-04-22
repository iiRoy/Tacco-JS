function GridPathSolver (rawData) {
  // Process the raw input string by splitting it into individual lines.
  const processedLines = rawData.split ( "\n" ) ;

  // Parse grid dimensions and total steps from the first line.
  const gridParams = processedLines[0].split ( " " ) ;
  let gridHeight = parseInt ( gridParams[0] ) ;
  let gridWidth = parseInt ( gridParams[1] ) ;
  let totalSteps = parseInt ( gridParams[2] ) ;

  // Parse the starting coordinates from the second line.
  const startCoords = processedLines[1].split ( " " ) ;
  let startRow = parseInt ( startCoords[0] ) ;
  let startCol = parseInt ( startCoords[1] ) ;

  // Extract the player's movement sequence and the opponent's movement sequence.
  const playerPath = processedLines[2].split ( "" ) ;
  const opponentPath = processedLines[3].split ( "" ) ;

  // Initialize variables to track the player's maximum allowed displacement in each direction.
  // These represent the 'reach' of the player from the starting point.
  let playerMaxLeft = 0 ;
  let playerMaxRight = 0 ;
  let playerMaxUp = 0 ;
  let playerMaxDown = 0 ;

  // Initialize variables to track the opponent's actual displacement from the starting point.
  // These are used to adjust the player's movement boundaries.
  let opponentCurrentLeft = 0 ;
  let opponentCurrentRight = 0 ;
  let opponentCurrentUp = 0 ;
  let opponentCurrentDown = 0 ;

  // Initialize the final outcome as "YES" (assuming path is valid until proven otherwise).
  let finalOutcome = "YES" ;

  // Iterate through each step of the movement sequences.
  for ( let stepIndex = 0 ; stepIndex < totalSteps ; stepIndex++ ) {

    // Update player's maximum reach based on their current move.
    if ( playerPath[stepIndex] === "L" ) {
      playerMaxLeft++ ;
    }
    if ( playerPath[stepIndex] === "R" ) {
      playerMaxRight++ ;
    }
    if ( playerPath[stepIndex] === "U" ) {
      playerMaxUp++ ;
    }
    if ( playerPath[stepIndex] === "D" ) {
      playerMaxDown++ ;
    }

    // Check if the player's current maximum reach exceeds grid boundaries.
    // If any boundary is crossed, the path is invalid.
    if ( playerMaxRight + startCol > gridWidth ) {
      finalOutcome = "NO" ;
      break ; // Exit loop early if path is invalid.
    }
    if ( startCol - playerMaxLeft <= 0 ) {
      finalOutcome = "NO" ;
      break ;
    }
    if ( playerMaxDown + startRow > gridHeight ) {
      finalOutcome = "NO" ;
      break ;
    }
    if ( startRow - playerMaxUp <= 0 ) {
      finalOutcome = "NO" ;
      break ;
    }

    // Adjust player's potential movement based on opponent's actions.
    // The opponent's moves can effectively shrink the player's available movement window.
    // If opponent moves right and is still within grid bounds (sc + r2 + 1 <= W),
    // then player's max left reach is reduced, and opponent's right displacement increases.
    if ( opponentPath[stepIndex] === "R" && startCol + opponentCurrentRight + 1 <= gridWidth ) {
      playerMaxLeft-- ;
      opponentCurrentRight++ ;
    }
    // If opponent moves left and is still within grid bounds (sc - l2 - 1 > 0),
    // then player's max right reach is reduced, and opponent's left displacement increases.
    if ( opponentPath[stepIndex] === "L" && startCol - opponentCurrentLeft - 1 > 0 ) {
      playerMaxRight-- ;
      opponentCurrentLeft++ ;
    }
    // If opponent moves up and is still within grid bounds (sr - u2 - 1 > 0),
    // then player's max down reach is reduced, and opponent's up displacement increases.
    if ( opponentPath[stepIndex] === "U" && startRow - opponentCurrentUp - 1 > 0 ) {
      playerMaxDown-- ;
      opponentCurrentUp++ ;
    }
    // If opponent moves down and is still within grid bounds (sr + d2 + 1 >= H),
    // then player's max up reach is reduced, and opponent's down displacement increases.
    if ( opponentPath[stepIndex] === "D" && startRow + opponentCurrentDown + 1 >= gridHeight ) {
      playerMaxUp-- ;
      opponentCurrentDown++ ;
    }
  }

  // Output the determined outcome.
  console.log ( '%s' , finalOutcome ) ;
  return finalOutcome ;
}

// Helper function for local testing in a browser environment.
function validateTestCases (testCaseId) {
  // Retrieve input data from a DOM element.
  let testInputString = document.getElementById ( "input" + testCaseId ).value ;
  // Compute the result using the main solver function.
  let computedResult = GridPathSolver ( testInputString ) ;
  // Default test verdict is "Wrong Answer".
  let testVerdict = "WA" ;
  // Compare computed result with the expected output.
  if ( computedResult === document.getElementById ( "output" + testCaseId ).value.split ( "\n" )[0] ) {
    testVerdict = "AC" ; // Change verdict to "Accepted" if they match.
  }
  // Update the UI with the test verdict.
  document.getElementById ( "result" + testCaseId ).innerHTML = testVerdict ;
}

// Execute the main solver function with input from standard input
// when running in a Node.js environment (e.g., for competitive programming).
GridPathSolver ( require ( "fs" ).readFileSync ( "/dev/stdin" , "utf8" ) ) ;