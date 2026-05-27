function shiftDice(direction, currentDiceState) {
    const [faceOne, faceTwo, faceThree, faceFour, faceFive, faceSix] = currentDiceState;
    let nextDiceState = [];

    if (direction === "N") {
        nextDiceState = [faceTwo, faceSix, faceThree, faceFour, faceOne, faceFive];
    } else if (direction === "S") {
        nextDiceState = [faceFive, faceOne, faceThree, faceFour, faceSix, faceTwo];
    } else if (direction === "E") {
        nextDiceState = [faceFour, faceTwo, faceOne, faceSix, faceFive, faceThree];
    } else if (direction === "W") {
        nextDiceState = [faceThree, faceTwo, faceSix, faceOne, faceFive, faceFour];
    }
    return nextDiceState;
}

function rotateDice(initialState) {
    const [f1, f2, f3, f4, f5, f6] = initialState;
    const rotatedState = [f1, f3, f5, f2, f4, f6];
    return rotatedState;
}

const globalSeenStates = {};
let finalVerdict = "YES";

function processRotations(diceConfiguration) {
    const localSeenConfigurations = {};
    const rotationCountLimit = 4;

    let currentConfig = [...diceConfiguration];

    for (let rotationIndex = 0; rotationIndex < rotationCountLimit; rotationIndex++) {
        const configStringRepresentation = currentConfig.join(",");
        if (!localSeenConfigurations.hasOwnProperty(configStringRepresentation)) {
            localSeenConfigurations[configStringRepresentation] = true;
        }
        currentConfig = rotateDice(currentConfig);
    }

    for (const configKey in localSeenConfigurations) {
        if (globalSeenStates.hasOwnProperty(configKey)) {
            finalVerdict = "No";
        } else {
            globalSeenStates[configKey] = true;
        }
    }
}

function performNorthRotationsAndChecks(diceState) {
    const northCycleIterations = 4;
    let currentDice = [...diceState]; // Work with a copy initially

    for (let iteration = 0; iteration < northCycleIterations; iteration++) {
        processRotations(currentDice);
        currentDice = shiftDice("N", currentDice);
    }
    return currentDice; // Return the state after all north shifts
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");
const numberOfTestCases = parseInt(inputLines.shift(), 10);

for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    let currentDice = inputLines[caseIndex].split(" ").map(Number);

    currentDice = performNorthRotationsAndChecks(currentDice);

    currentDice = shiftDice("E", currentDice);
    processRotations(currentDice);

    currentDice = shiftDice("S", currentDice);
    currentDice = shiftDice("S", currentDice);
    processRotations(currentDice);

    if (finalVerdict === "No") {
        break;
    }
}
console.log(finalVerdict);
