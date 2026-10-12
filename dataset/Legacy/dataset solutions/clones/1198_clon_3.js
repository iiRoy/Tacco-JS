function getDiceConfigString(diceArray) {
    return diceArray.join(",");
}

function shiftDice(direction, currentDiceState) {
    const NUM_DICE_FACES = 6;
    const [face1, face2, face3, face4, face5, face6] = currentDiceState;
    let nextDiceState;

    switch (direction) {
        case "N":
            nextDiceState = [face2, face6, face3, face4, face1, face5];
            break;
        case "S":
            nextDiceState = [face5, face1, face3, face4, face6, face2];
            break;
        case "E":
            nextDiceState = [face4, face2, face1, face6, face5, face3];
            break;
        case "W":
            nextDiceState = [face3, face2, face6, face1, face5, face4];
            break;
        default:
            nextDiceState = [...currentDiceState];
            break;
    }
    return nextDiceState;
}

function rotateDice(initialDice) {
    const [f1, f2, f3, f4, f5, f6] = initialDice;
    const rotatedDice = [f1, f3, f5, f2, f4, f6];
    return rotatedDice;
}

var globalSeenConfigurations = {};
var overallResult = "Yes";

function processRotations(diceConfiguration) {
    var localSeenConfigurations = {};
    var currentConfig = [...diceConfiguration];

    for (var rotationIteration = 0; rotationIteration < 4; rotationIteration++) {
        var configKey = getDiceConfigString(currentConfig);
        if (!localSeenConfigurations.hasOwnProperty(configKey)) {
            localSeenConfigurations[configKey] = true;
        }
        currentConfig = rotateDice(currentConfig);
    }

    var keysToProcess = Object.keys(localSeenConfigurations);
    for (var i = 0; i < keysToProcess.length; i++) {
        var key = keysToProcess[i];
        if (globalSeenConfigurations.hasOwnProperty(key)) {
            overallResult = "No";
            return;
        } else {
            globalSeenConfigurations[key] = true;
        }
    }
}

function executeNorthCycle(diceState) {
    processRotations(diceState);
    return shiftDice("N", diceState);
}

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = (rawInputData.trim()).split("\n");
var numberOfTestCases = Number(inputLines.shift());

for (var caseIdx = 0; caseIdx < numberOfTestCases; caseIdx++) {
    var currentCaseDice = inputLines[caseIdx].split(" ").map(Number);

    for (var cycleCount = 0; cycleCount < 4; cycleCount++) {
        currentCaseDice = executeNorthCycle(currentCaseDice);
        if (overallResult === "No") break;
    }
    if (overallResult === "No") break;

    currentCaseDice = shiftDice("E", currentCaseDice);
    processRotations(currentCaseDice);
    if (overallResult === "No") break;

    currentCaseDice = shiftDice("S", currentCaseDice);
    currentCaseDice = shiftDice("S", currentCaseDice);
    processRotations(currentCaseDice);
    if (overallResult === "No") break;
}

console.log(overallResult);
