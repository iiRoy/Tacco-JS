const appSettings = { input: '/dev/stdin', newline: '\n' }; // linux

const assertionModule = require('assert');

const TILE_COUNT = 16;

const targetBoardState = '123456789ABCDEF0';

const fileContent = require('fs').readFileSync(appSettings.input, 'ascii');
const trimmedContent = fileContent.trim();
const inputLines = trimmedContent.split(appSettings.newline);

function processLineToHex(lineContent) {
    return lineContent.split(' ').map(function (numericString) {
        return Number(numericString).toString(16);
    }).join('');
}

const initialBoardState = inputLines.map(processLineToHex).join('').toUpperCase();

const moveUpIndices = [null, null, null, null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const moveDownIndices = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null, null, null, null];
const moveLeftIndices = [null, 0, 1, 2, null, 4, 5, 6, null, 8, 9, 10, null, 12, 13, 14];
const moveRightIndices = [1, 2, 3, null, 5, 6, 7, null, 9, 10, 11, null, 13, 14, 15, null];

function performTileSwap(boardString, indexOne, indexTwo) {
    const boardCharacters = boardString.split('');
    const temporaryChar = boardCharacters[indexOne];
    boardCharacters[indexOne] = boardCharacters[indexTwo];
    boardCharacters[indexTwo] = temporaryChar;
    return boardCharacters.join('');
}

function solvePuzzleIDDFS(currentDepth, currentBoard) {
    if (currentDepth === 0) {
        return currentBoard === targetBoardState;
    }

    const zeroTileIndex = currentBoard.indexOf('0');

    const possibleMoveDirections = [moveUpIndices, moveDownIndices, moveLeftIndices, moveRightIndices];

    for (const directionMap of possibleMoveDirections) {
        const targetTileIndex = directionMap[zeroTileIndex];

        if (targetTileIndex !== null) {
            const nextBoardState = performTileSwap(currentBoard, zeroTileIndex, targetTileIndex);
            if (solvePuzzleIDDFS(currentDepth - 1, nextBoardState)) {
                return true;
            }
        }
    }

    return false;
}

let depthLimit = 0;
const MAX_SEARCH_DEPTH = 45;

for (depthLimit = 0; depthLimit <= MAX_SEARCH_DEPTH; depthLimit++) {
    if (solvePuzzleIDDFS(depthLimit, initialBoardState)) {
        break;
    }
}
console.log(depthLimit);
