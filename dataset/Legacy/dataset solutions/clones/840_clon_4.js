const directionVectors = [
    { y: -1, x: -1 }, { y: -1, x: 0 }, { y: -1, x: 1 },
    { y: 0, x: -1 },                    { y: 0, x: 1 },
    { y: 1, x: -1 }, { y: 1, x: 0 }, { y: 1, x: 1 }
];

function calculateFlips(rowCoord, colCoord, opponentSymbol, playerSymbol, boardState) {
    return directionVectors.reduce((totalFlips, currentDir) => {
        let lineFlipCount = 0;
        let stepDistance = 1;
        while (true) {
            const currentY = rowCoord + currentDir.y * stepDistance;
            const currentX = colCoord + currentDir.x * stepDistance;
            const cellContent = boardState[currentY]?.[currentX];

            if (cellContent === "f" || cellContent === "." || cellContent === undefined) {
                return totalFlips;
            } else if (cellContent === opponentSymbol) {
                lineFlipCount++;
            } else if (cellContent === playerSymbol) {
                return totalFlips + lineFlipCount;
            }
            stepDistance++;
        }
    }, 0);
}

function executeMoveAndFlip(rowCoord, colCoord, opponentSymbol, playerSymbol, boardState) {
    boardState[rowCoord][colCoord] = playerSymbol;

    directionVectors.forEach(currentDir => {
        const piecesToFlip = [];
        let stepDistance = 1;
        while (true) {
            const currentY = rowCoord + currentDir.y * stepDistance;
            const currentX = colCoord + currentDir.x * stepDistance;
            const cellContent = boardState[currentY]?.[currentX];

            if (cellContent === "f" || cellContent === "." || cellContent === undefined) {
                break;
            } else if (cellContent === opponentSymbol) {
                piecesToFlip.push([currentY, currentX]);
            } else if (cellContent === playerSymbol) {
                piecesToFlip.forEach(([flipY, flipX]) => {
                    boardState[flipY][flipX] = playerSymbol;
                });
                break;
            }
            stepDistance++;
        }
    });
}

function determineOptimalMove(playerSymbol, opponentSymbol, rowIterationOrder, colIterationOrder) {
    const potentialMoves = [];

    for (const r of rowIterationOrder) {
        for (const c of colIterationOrder) {
            if (yx[r][c] === ".") {
                const currentFlips = calculateFlips(r, c, opponentSymbol, playerSymbol, yx);
                if (currentFlips > 0) {
                    potentialMoves.push({ position: [r, c], score: currentFlips });
                }
            }
        }
    }

    if (potentialMoves.length === 0) {
        return [];
    }

    const maxScoreFound = potentialMoves.reduce((maxVal, move) => Math.max(maxVal, move.score), -1);

    const bestCandidates = potentialMoves.filter(move => move.score === maxScoreFound);

    return bestCandidates[0].position;
}

function findOptimalMoveForO() {
    const rowsAsc = Array.from({ length: 8 }, (_, i) => i + 1);
    const colsAsc = Array.from({ length: 8 }, (_, i) => i + 1);
    return determineOptimalMove("o", "x", rowsAsc, colsAsc);
}

function findOptimalMoveForX() {
    const rowsDesc = Array.from({ length: 8 }, (_, i) => 8 - i);
    const colsDesc = Array.from({ length: 8 }, (_, i) => 8 - i);
    return determineOptimalMove("x", "o", rowsDesc, colsDesc);
}

var boardInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = boardInput.trim().split("\n");
var yx = [];

yx.push("ffffffffff".split(""));
inputLines.forEach(function(lineContent) {
   lineContent = "f" + lineContent + "f";
   yx.push(lineContent.split(""));
});
yx.push("ffffffffff".split(""));

var consecutivePasses = 0;
while (true) {
   var moveForO = findOptimalMoveForO();
   if (moveForO.length === 0) {
       consecutivePasses++;
   } else {
       consecutivePasses = 0;
       executeMoveAndFlip(moveForO[0], moveForO[1], "x", "o", yx);
   }

   var moveForX = findOptimalMoveForX();
   if (moveForX.length === 0) {
       consecutivePasses++;
   } else {
       consecutivePasses = 0;
       executeMoveAndFlip(moveForX[0], moveForX[1], "o", "x", yx);
   }

   if (consecutivePasses >= 2) {
       break;
   }
}

yx.shift();
yx.pop();
console.log(yx.join("\n").replace(/\,|f/g,""));
