const parseNumbers = (lineString) => lineString.split(" ").map(Number);

function ProcessGameInput(rawInputData) {
  const inputLines = rawInputData.split("\n");

  const [gridHeight, gridWidth, numMoves] = parseNumbers(inputLines[0]);
  const [startRow, startCol] = parseNumbers(inputLines[1]);

  const playerMoveSequence = inputLines[2].split("");
  const opponentMoveSequence = inputLines[3].split("");

  let playerLeftAccum = 0;
  let playerRightAccum = 0;
  let playerUpAccum = 0;
  let playerDownAccum = 0;

  let opponentLeftAccum = 0;
  let opponentRightAccum = 0;
  let opponentUpAccum = 0;
  let opponentDownAccum = 0;

  let finalOutcome = "YES";

  for (let currentMoveIndex = 0; currentMoveIndex < numMoves; currentMoveIndex++) {
    const currentPlayerAction = playerMoveSequence[currentMoveIndex];
    const currentOpponentAction = opponentMoveSequence[currentMoveIndex];

    // Update player's accumulated moves
    switch (currentPlayerAction) {
      case "L":
        playerLeftAccum++;
        break;
      case "R":
        playerRightAccum++;
        break;
      case "U":
        playerUpAccum++;
        break;
      case "D":
        playerDownAccum++;
        break;
    }

    // Check if player's accumulated moves exceed grid boundaries
    const isBeyondRightEdge = (playerRightAccum + startCol) > gridWidth;
    const isBeyondLeftEdge = (startCol - playerLeftAccum) <= 0;
    const isBeyondBottomEdge = (playerDownAccum + startRow) > gridHeight;
    const isBeyondTopEdge = (startCol - playerUpAccum) <= 0; // Preserving original bug: uses startCol for Up check

    if (isBeyondRightEdge || isBeyondLeftEdge || isBeyondBottomEdge || isBeyondTopEdge) {
      finalOutcome = "NO";
      break;
    }

    // Adjust player's accumulated moves based on opponent's actions
    // Opponent's moves effectively "push back" the player's potential movement in the opposite direction
    // and increment opponent's own accumulated moves.

    // Opponent moves Right
    const canOpponentMoveRight = (startCol + opponentRightAccum + 1) <= gridWidth;
    if (currentOpponentAction === "R" && canOpponentMoveRight) {
      playerLeftAccum--;
      opponentRightAccum++;
    }

    // Opponent moves Left
    const canOpponentMoveLeft = (startCol - opponentLeftAccum - 1) > 0;
    if (currentOpponentAction === "L" && canOpponentMoveLeft) {
      playerRightAccum--;
      opponentLeftAccum++;
    }

    // Opponent moves Up
    const canOpponentMoveUp = (startRow - opponentUpAccum - 1) > 0;
    if (currentOpponentAction === "U" && canOpponentMoveUp) {
      playerDownAccum--;
      opponentUpAccum++;
    }

    // Opponent moves Down
    const canOpponentMoveDown = (startRow + opponentDownAccum + 1) >= gridHeight;
    if (currentOpponentAction === "D" && canOpponentMoveDown) {
      playerUpAccum--;
      opponentDownAccum++;
    }
  }

  console.log('%s', finalOutcome);
  return finalOutcome;
}

function testRunner(testCaseNumber) {
  const inputElement = document.getElementById("input" + testCaseNumber);
  const outputElement = document.getElementById("output" + testCaseNumber);
  const resultElement = document.getElementById("result" + testCaseNumber);

  if (!inputElement || !outputElement || !resultElement) {
    console.error("Required DOM elements not found for test case:", testCaseNumber);
    return;
  }

  const testInputData = inputElement.value;
  const actualResult = ProcessGameInput(testInputData);
  const expectedResult = outputElement.value.split("\n")[0];

  let testVerdict = "WA";
  if (actualResult === expectedResult) {
    testVerdict = "AC";
  }
  resultElement.innerHTML = testVerdict;
}

ProcessGameInput(require("fs").readFileSync("/dev/stdin", "utf8"));
