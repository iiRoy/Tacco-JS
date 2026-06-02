function shiftDice(directionChar, currentDiceState) {
    // Extract individual face values from the current dice state array
    let faceOne = currentDiceState[0];
    let faceTwo = currentDiceState[1];
    let faceThree = currentDiceState[2];
    let faceFour = currentDiceState[3];
    let faceFive = currentDiceState[4];
    let faceSix = currentDiceState[5];

    // Initialize an array to hold the new dice state after the move
    const nextDiceState = [];

    // Determine the new arrangement of faces based on the direction
    if (directionChar === 'N') {
        // North move: top (1) goes to front (2), front (2) goes to bottom (6), bottom (6) goes to back (5), back (5) goes to top (1)
        nextDiceState[0] = faceTwo;
        nextDiceState[1] = faceSix;
        nextDiceState[2] = faceThree;
        nextDiceState[3] = faceFour;
        nextDiceState[4] = faceOne;
        nextDiceState[5] = faceFive;
    } else if (directionChar === 'S') {
        // South move: top (1) goes to back (5), back (5) goes to bottom (6), bottom (6) goes to front (2), front (2) goes to top (1)
        nextDiceState[0] = faceFive;
        nextDiceState[1] = faceOne;
        nextDiceState[2] = faceThree;
        nextDiceState[3] = faceFour;
        nextDiceState[4] = faceSix;
        nextDiceState[5] = faceTwo;
    } else if (directionChar === 'E') {
        // East move: top (1) goes to right (4), right (4) goes to bottom (6), bottom (6) goes to left (3), left (3) goes to top (1)
        nextDiceState[0] = faceFour;
        nextDiceState[1] = faceTwo;
        nextDiceState[2] = faceOne;
        nextDiceState[3] = faceSix;
        nextDiceState[4] = faceFive;
        nextDiceState[5] = faceThree;
    } else if (directionChar === 'W') {
        // West move: top (1) goes to left (3), left (3) goes to bottom (6), bottom (6) goes to right (4), right (4) goes to top (1)
        nextDiceState[0] = faceThree;
        nextDiceState[1] = faceTwo;
        nextDiceState[2] = faceSix;
        nextDiceState[3] = faceOne;
        nextDiceState[4] = faceFive;
        nextDiceState[5] = faceFour;
    }

    // Return the new configuration of the dice
    return nextDiceState;
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data by splitting into lines
let lineData = rawData.trim().split('\n');

// The initial state of the dice (top, front, left, right, back, bottom)
let currentCubeFaces = lineData[0].split(' ').map(Number);

// Remove the first two lines from the processed input array
// The first line contains the initial dice state, which has already been parsed.
lineData.shift();
// The second line (which was originally the first target, but now it's the second line after the first shift)
// is also removed as per the original logic.
lineData.shift();

// Define the possible cardinal directions for movement
const cardinalDirections = ['N', 'S', 'E', 'W'];

// Iterate over each remaining line of input, which represents a target state
lineData.forEach(function(lineContent) {
    // Parse the target top and front faces from the current line
    const targetFaceOne = parseInt(lineContent.split(' ')[0], 10); // Target top face
    const targetFaceTwo = parseInt(lineContent.split(' ')[1], 10); // Target front face

    // Keep rolling the dice randomly until the current top and front faces match the target
    while (!(currentCubeFaces[0] === targetFaceOne && currentCubeFaces[1] === targetFaceTwo)) {
        // Generate a random index to pick a direction (0-3 for N, S, E, W)
        const randomDirectionIndex = Math.floor(Math.random() * 4);
        // Move the dice in the randomly chosen direction
        currentCubeFaces = shiftDice(cardinalDirections[randomDirectionIndex], currentCubeFaces);
    }
    // Once the target state is reached, print the value of the bottom face (index 2)
    console.log(currentCubeFaces[2]);
});
