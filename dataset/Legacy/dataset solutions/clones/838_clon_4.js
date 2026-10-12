let gameBoard = [];

const directionOffsets = [
  { dy: -1, dx: -1 }, { dy: -1, dx: 0 }, { dy: -1, dx: 1 },
  { dy: 0, dx: -1 }, { dy: 0, dx: 1 },
  { dy: 1, dx: -1 }, { dy: 1, dx: 0 }, { dy: 1, dx: 1 }
];

function tallyPotentialFlips(placementY, placementX, playerMarker, opponentMarker) {
  let totalFlippedCount = 0;

  for (const { dy: deltaY, dx: deltaX } of directionOffsets) {
    let currentDirectionFlips = 0;
    let step = 1;
    while (true) {
      const currentY = placementY + deltaY * step;
      const currentX = placementX + deltaX * step;
      const cellContent = gameBoard[currentY][currentX];

      if (cellContent === "f" || cellContent === ".") {
        break;
      } else if (cellContent === opponentMarker) {
        currentDirectionFlips++;
      } else if (cellContent === playerMarker) {
        totalFlippedCount += currentDirectionFlips;
        break;
      }
      step++;
    }
  }
  return totalFlippedCount;
}

function applyMoveAndFlipPieces(targetY, targetX, playerMarker, opponentMarker) {
  gameBoard[targetY][targetX] = playerMarker;

  for (const { dy: deltaY, dx: deltaX } of directionOffsets) {
    const piecesToFlipInDirection = [];
    let step = 1;
    let foundOpponentPieceSequence = false;

    while (true) {
      const currentY = targetY + deltaY * step;
      const currentX = targetX + deltaX * step;
      const cellContent = gameBoard[currentY][currentX];

      if (cellContent === "f" || cellContent === ".") {
        piecesToFlipInDirection.length = 0;
        break;
      } else if (cellContent === opponentMarker) {
        piecesToFlipInDirection.push({ y: currentY, x: currentX });
        foundOpponentPieceSequence = true;
      } else if (cellContent === playerMarker) {
        if (foundOpponentPieceSequence) {
          for (const { y, x } of piecesToFlipInDirection) {
            gameBoard[y][x] = playerMarker;
          }
        }
        break;
      }
      step++;
    }
  }
}

function findOptimalMove(playerChar, opponentChar, iterateDescending = false) {
  let highestFlipCount = 0;
  let bestMoveCoordinates = [];

  const boardRows = Array.from({ length: 8 }, (_, i) => i + 1);
  const boardCols = Array.from({ length: 8 }, (_, j) => j + 1);

  const allPossiblePositions = boardRows.flatMap(y =>
    boardCols.map(x => ({ y, x }))
  );

  const orderedPositions = iterateDescending
    ? allPossiblePositions.reverse()
    : allPossiblePositions;

  for (const { y: currentY, x: currentX } of orderedPositions) {
    if (gameBoard[currentY][currentX] !== ".") {
      continue;
    }

    const currentFlips = tallyPotentialFlips(currentY, currentX, playerChar, opponentChar);

    if (currentFlips > highestFlipCount) {
      highestFlipCount = currentFlips;
      bestMoveCoordinates = [currentY, currentX];
    }
  }
  return bestMoveCoordinates;
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

gameBoard.push(Array(10).fill("f"));
inputLines.forEach(line => {
  gameBoard.push(["f", ...line.split(""), "f"]);
});
gameBoard.push(Array(10).fill("f"));

let consecutivePasses = 0;

while (true) {
  const xPlayerMoveResult = findOptimalMove("o", "x", false);
  if (xPlayerMoveResult.length === 0) {
    consecutivePasses++;
  } else {
    consecutivePasses = 0;
    applyMoveAndFlipPieces(xPlayerMoveResult[0], xPlayerMoveResult[1], "o", "x");
  }

  const oPlayerMoveResult = findOptimalMove("x", "o", true);
  if (oPlayerMoveResult.length === 0) {
    consecutivePasses++;
  } else {
    consecutivePasses = 0;
    applyMoveAndFlipPieces(oPlayerMoveResult[0], oPlayerMoveResult[1], "x", "o");
  }

  if (consecutivePasses >= 2) {
    break;
  }
}

const finalBoardState = gameBoard
  .slice(1, -1)
  .map(row => row.slice(1, -1).join(""))
  .join("\n");

console.log(finalBoardState);
