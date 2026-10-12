'use strict';

const countOnesInBinary = (binaryString) => (binaryString.match(/1/g) || []).length;

const createRepeatedCharString = (charToRepeat, count) => charToRepeat.repeat(Math.max(0, count));

const executePathfinding = (rawInputData) => {
    const generateBinaryPermutations = (startBinaryString, endBinaryString) => {
        const requiredOneCount = countOnesInBinary(startBinaryString);
        const startInteger = parseInt(startBinaryString, 2);
        const endInteger = parseInt(endBinaryString, 2);
        const targetLength = endBinaryString.length;
        const collectedBinaryStrings = [];

        for (let currentNumber = startInteger; currentNumber <= endInteger; currentNumber++) {
            const currentBinaryRepresentation = currentNumber.toString(2);
            if (countOnesInBinary(currentBinaryRepresentation) !== requiredOneCount) {
                continue;
            }
            const leadingZeros = createRepeatedCharString('0', targetLength - currentBinaryRepresentation.length);
            collectedBinaryStrings.push(leadingZeros + currentBinaryRepresentation);
        }
        return collectedBinaryStrings;
    };

    const inputLines = rawInputData.trim().split('\n');
    const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);

    const gameGrid = inputLines.slice(1, 1 + gridHeight).map(rowString =>
        rowString.split('').slice(0, gridWidth).map(cellChar => (cellChar === '.' ? 1 : 0))
    );

    let minimumWallEncounters = Infinity;

    const requiredDownMoves = gridHeight - 1;
    const requiredRightMoves = gridWidth - 1;

    const smallestPathPattern = createRepeatedCharString('0', requiredRightMoves) + createRepeatedCharString('1', requiredDownMoves);
    const largestPathPattern = createRepeatedCharString('1', requiredDownMoves) + createRepeatedCharString('0', requiredRightMoves);

    const allPossiblePathPatterns = generateBinaryPermutations(smallestPathPattern, largestPathPattern);

    const evaluatePositionForWall = (yCoord, xCoord, currentGrid, currentWallCount) => {
        if (currentGrid[yCoord][xCoord] === 0) {
            return currentWallCount + 1;
        }
        return currentWallCount;
    };

    for (const pathSequence of allPossiblePathPatterns) {
        const pathMoves = pathSequence.split('');

        let currentXPosition = 0;
        let currentYPosition = 0;
        let wallCountForCurrentPath = 0;

        wallCountForCurrentPath = evaluatePositionForWall(currentYPosition, currentXPosition, gameGrid, wallCountForCurrentPath);

        for (const moveInstruction of pathMoves) {
            if (moveInstruction === '1') {
                currentYPosition++;
            } else {
                currentXPosition++;
            }
            wallCountForCurrentPath = evaluatePositionForWall(currentYPosition, currentXPosition, gameGrid, wallCountForCurrentPath);
        }
        minimumWallEncounters = Math.min(minimumWallEncounters, wallCountForCurrentPath);
    }

    console.log(minimumWallEncounters);
};

executePathfinding(require('fs').readFileSync('/dev/stdin', 'utf8'));
