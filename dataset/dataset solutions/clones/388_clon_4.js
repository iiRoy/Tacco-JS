function processGridPattern(dimensionValue) {
    if (dimensionValue === 1) {
        return "#";
    }

    const patternMatrix = Array.from({ length: dimensionValue }, () =>
        Array(dimensionValue).fill("~")
    );

    const movementVectors = [
        { dRow: -1, dCol: 0 },
        { dRow: 0, dCol: 1 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 }
    ];

    let finalMarkedLocation = null;

    const traversalPathStack = [];
    traversalPathStack.push({
        currentR: dimensionValue - 1,
        currentC: 0,
        directionIdx: 0
    });

    const pathMarker = 'X';

    while (traversalPathStack.length > 0) {
        const { currentR, currentC, directionIdx } = traversalPathStack.pop();

        if (patternMatrix[currentR][currentC] !== "~") {
            continue;
        }

        const currentVector = movementVectors[directionIdx];
        const nextR = currentR + currentVector.dRow;
        const nextC = currentC + currentVector.dCol;

        const isOutOfBounds =
            nextR < 0 ||
            nextC < 0 ||
            nextR >= dimensionValue ||
            nextC >= dimensionValue;

        if (isOutOfBounds) {
            const newDirectionIdx = (directionIdx + 1) % 4;
            traversalPathStack.push({
                currentR: currentR,
                currentC: currentC,
                directionIdx: newDirectionIdx
            });
        } else {
            if (patternMatrix[nextR][nextC] === pathMarker) {
                patternMatrix[currentR][currentC] = "~";

                let jumpTargetR, jumpTargetC, jumpNewDirection;

                switch (directionIdx) {
                    case 3:
                        jumpTargetR = currentR - 1;
                        jumpTargetC = currentC + 1;
                        jumpNewDirection = 0;
                        break;
                    case 0:
                        jumpTargetR = currentR + 1;
                        jumpTargetC = currentC + 1;
                        jumpNewDirection = 1;
                        break;
                    case 1:
                        jumpTargetR = currentR + 1;
                        jumpTargetC = currentC - 1;
                        jumpNewDirection = 2;
                        break;
                    case 2:
                        jumpTargetR = currentR - 1;
                        jumpTargetC = currentC - 1;
                        jumpNewDirection = 3;
                        break;
                }
                traversalPathStack.push({
                    currentR: jumpTargetR,
                    currentC: jumpTargetC,
                    directionIdx: jumpNewDirection
                });
            } else {
                patternMatrix[currentR][currentC] = pathMarker;
                finalMarkedLocation = [currentR, currentC];
                traversalPathStack.push({
                    currentR: nextR,
                    currentC: nextC,
                    directionIdx: directionIdx
                });
            }
        }
    }

    if (dimensionValue % 2 === 0 && finalMarkedLocation) {
        patternMatrix[finalMarkedLocation[0]][finalMarkedLocation[1]] = "~";
    }

    return patternMatrix
        .map((row) => row.join(""))
        .join("\n")
        .replace(/~/g, " ");
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericSequence = rawInputData.trim().split("\n").map(Number);

let totalTestCases = numericSequence.shift();

while (totalTestCases--) {
    const currentGridDimension = numericSequence.shift();
    const generatedGridOutput = processGridPattern(currentGridDimension);
    console.log(generatedGridOutput);
}