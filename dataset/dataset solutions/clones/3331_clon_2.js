// This JavaScript module implements a dynamic programming solution for a game theory problem.
// It determines whether the first or second player wins given a set of moves and a target value.

function ProcessGame(rawData) {
  // The input string is first broken down into separate lines.
  let processedLines = rawData.split("\n");

  // The first line contains two space-separated integers: N (number of move options) and K (target value).
  let firstLineParts = processedLines[0].split(" ");
  let numElements = parseInt(firstLineParts[0], 10); // N, the count of available moves.
  let targetValue = parseInt(firstLineParts[1], 10); // K, the goal value to reach.

  // The second line contains N space-separated integers, representing the available move options.
  let moveOptions = processedLines[1].split(" ").map(valStr => parseInt(valStr, 10));

  // A dynamic programming array 'gameStates' is initialized.
  // Its size is 'targetValue + 1', and all entries are initially set to 0.
  // Each index 'idx' in 'gameStates' will store the outcome for a game ending at value 'idx'.
  let gameStates = new Array(targetValue + 1).fill(0);

  // Initialize the base cases for the DP table.
  // For any value 'idx' less than the smallest possible move, the second player automatically wins.
  // This is because the first player cannot make any valid move from such a state.
  for (let idx = 0; idx < moveOptions[0]; idx++) {
    gameStates[idx] = "Second";
  }

  // Iterate through all possible game states from the smallest move option up to the target value K.
  for (let idx = moveOptions[0]; idx < targetValue + 1; idx++) {
    let canWin = 0; // This flag indicates if the first player can force a win from the current state 'idx'.

    // For each current state 'idx', evaluate all possible moves the first player could make.
    for (let optIdx = 0; optIdx < numElements; optIdx++) {
      // If making a move 'moveOptions[optIdx]' leads to a state where the *second* player wins
      // (meaning the opponent is forced into a losing position), then the first player can win from 'idx'.
      if (gameStates[idx - moveOptions[optIdx]] === "Second") {
        canWin = 1; // Set the flag to indicate a winning move exists.
        break; // Once a winning move is found, no need to check other moves for this 'idx'.
      }
    }

    // Based on whether a winning move was found, assign the outcome for the current state 'idx'.
    if (canWin === 1) {
      gameStates[idx] = "First"; // If a winning move exists, the first player wins from 'idx'.
    } else {
      gameStates[idx] = "Second"; // Otherwise, the second player wins from 'idx'.
    }
  }

  // The final outcome of the game is stored at the 'targetValue' index in the 'gameStates' array.
  let finalOutcome = gameStates[targetValue];

  // Print the determined outcome to standard output.
  console.log('%s', finalOutcome);

  // Return the result.
  return finalOutcome;
}

// This auxiliary function is provided for local debugging within a browser environment.
// It simulates testing the solution against predefined inputs and outputs.
function testSolution(testCaseNum) {
  // Retrieve the input string for the specific test case from a DOM element.
  let currentInput = document.getElementById("input" + testCaseNum).value;
  // Execute the main game logic with the retrieved input.
  let actualOutcome = ProcessGame(currentInput);
  // Retrieve the expected output for the test case from another DOM element.
  let expectedOutcome = document.getElementById("output" + testCaseNum).value.split("\n")[0];

  let testResult = "WA"; // Initialize the test result as "Wrong Answer".
  // Compare the actual outcome with the expected outcome.
  if (actualOutcome === expectedOutcome) {
    testResult = "AC"; // If they match, the test is "Accepted".
  }
  // Update a DOM element to display the result of the test.
  document.getElementById("result" + testCaseNum).innerHTML = testResult;
}

// This line serves as the entry point for the script when executed in a Node.js environment.
// It reads the entire content of standard input, converts it to a UTF-8 string, and passes it to ProcessGame.
ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));
