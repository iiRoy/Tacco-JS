const C_CHAR_IDENTIFIER = 'c';
const DOT_CHAR_IDENTIFIER = '.';
const INITIAL_DISTANCE_VALUE = -1;

function calculateCharacterDistance(characterSymbol, currentDistanceCounter) {
    if (characterSymbol === C_CHAR_IDENTIFIER) {
        return { computedDistance: 0, nextCounterState: 1 };
    } else if (characterSymbol === DOT_CHAR_IDENTIFIER) {
        if (currentDistanceCounter === INITIAL_DISTANCE_VALUE) {
            return { computedDistance: INITIAL_DISTANCE_VALUE, nextCounterState: INITIAL_DISTANCE_VALUE };
        } else {
            return { computedDistance: currentDistanceCounter, nextCounterState: currentDistanceCounter + 1 };
        }
    }
    // This case should not be reached based on problem constraints (only 'c' or '.')
    return { computedDistance: INITIAL_DISTANCE_VALUE, nextCounterState: currentDistanceCounter };
}

var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

// Iterate through the input lines, skipping the first one which is usually a count
for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
    const currentInputString = inputLines[lineIndex];
    const characterSequence = currentInputString.split("");
    let currentDistanceFromLastC = INITIAL_DISTANCE_VALUE;
    const lineDistanceResults = [];

    for (let charPosition = 0; charPosition < characterSequence.length; charPosition++) {
        const charAtPosition = characterSequence[charPosition];
        const processingOutcome = calculateCharacterDistance(charAtPosition, currentDistanceFromLastC);
        lineDistanceResults.push(processingOutcome.computedDistance);
        currentDistanceFromLastC = processingOutcome.nextCounterState;
    }
    console.log(lineDistanceResults.join(" "));
}
