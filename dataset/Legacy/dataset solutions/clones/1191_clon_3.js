const TOP_FACE_IDX = 0;
const NORTH_FACE_IDX = 1;
const EAST_FACE_IDX = 2;
const WEST_FACE_IDX = 3;
const SOUTH_FACE_IDX = 4;
const BOTTOM_FACE_IDX = 5;

function parseTargetCoordinates(coordinateString) {
    const parts = coordinateString.split(" ");
    const targetX = parseInt(parts[0], 10);
    const targetY = parseInt(parts[1], 10);
    return { targetX, targetY };
}

function rotateDice(directionChar, currentDiceState) {
    const [
        faceTop,
        faceNorth,
        faceEast,
        faceWest,
        faceSouth,
        faceBottom
    ] = currentDiceState;

    let newDiceState;

    switch (directionChar) {
        case "N":
            newDiceState = [faceNorth, faceBottom, faceEast, faceWest, faceTop, faceSouth];
            break;
        case "S":
            newDiceState = [faceSouth, faceTop, faceEast, faceWest, faceBottom, faceNorth];
            break;
        case "E":
            newDiceState = [faceWest, faceNorth, faceTop, faceBottom, faceSouth, faceEast];
            break;
        case "W":
            newDiceState = [faceEast, faceNorth, faceBottom, faceTop, faceSouth, faceWest];
            break;
        default:
            newDiceState = [...currentDiceState];
            break;
    }
    return newDiceState;
}

const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

const initialDiceValues = inputLines[0].split(" ").map(Number);
let activeDice = initialDiceValues;

inputLines.splice(0, 2);

const cardinalDirections = ["N", "S", "E", "W"];

inputLines.forEach(function(targetCoordsStr) {
    const { targetX, targetY } = parseTargetCoordinates(targetCoordsStr);

    while (activeDice[TOP_FACE_IDX] !== targetX || activeDice[NORTH_FACE_IDX] !== targetY) {
        const randomDirectionIndex = Math.floor(Math.random() * cardinalDirections.length);
        const chosenDirection = cardinalDirections[randomDirectionIndex];
        activeDice = rotateDice(chosenDirection, activeDice);
    }
    console.log(activeDice[EAST_FACE_IDX]);
});
