const obtainNextInput = () => next();
const displayResult = (val) => myout(val);

function findSequencePosition() {
    const sourceString = obtainNextInput();
    const targetSequence = obtainNextInput();

    const charLocations = new Map();
    Array.from(sourceString).forEach((character, position) => {
        if (!charLocations.has(character)) {
            charLocations.set(character, []);
        }
        charLocations.get(character).push(position);
    });

    // This helper function finds the index within `indicesCollection`
    // of the first element that is greater than or equal to `lowerBound`.
    // If no such element exists, it returns `indicesCollection.length`.
    function locateNextAvailable(indicesCollection, lowerBound) {
        let startPoint = 0;
        let endPoint = indicesCollection.length; // Exclusive upper bound
        while (startPoint < endPoint) {
            const midPoint = Math.floor((startPoint + endPoint) / 2);
            if (indicesCollection[midPoint] >= lowerBound) {
                endPoint = midPoint;
            } else {
                startPoint = midPoint + 1;
            }
        }
        return startPoint;
    }

    const initialProcessingState = {
        accumulatedLength: 0,        // Represents the total length accumulated from "wrapping around" the source string
        lastLocatedIndex: -1,        // Represents the 0-indexed position of the previously found character in the source string
        sequenceFeasible: true       // Flag to track if all characters of targetSequence are found
    };

    const finalProcessingState = Array.from(targetSequence).reduce((currentState, currentCharacter) => {
        if (!currentState.sequenceFeasible) {
            return currentState; // Propagate the failure state
        }

        if (!charLocations.has(currentCharacter)) {
            return { ...currentState, sequenceFeasible: false }; // Character not present in sourceString
        }

        const currentCharacterPositions = charLocations.get(currentCharacter);
        
        // Find the first occurrence of `currentCharacter` that is strictly after `lastLocatedIndex`
        let foundPositionInList = locateNextAvailable(currentCharacterPositions, currentState.lastLocatedIndex + 1);
        
        let newAccumulatedLength = currentState.accumulatedLength;
        let newLastLocatedIndex;

        if (foundPositionInList === currentCharacterPositions.length) {
            // All occurrences are before or at the `lastLocatedIndex`, so we need to "wrap around"
            newAccumulatedLength += sourceString.length;
            newLastLocatedIndex = currentCharacterPositions[0]; // Take the very first occurrence after wrapping
        } else {
            // Found an occurrence strictly after the `lastLocatedIndex` within the current string
            newLastLocatedIndex = currentCharacterPositions[foundPositionInList];
        }

        return {
            accumulatedLength: newAccumulatedLength,
            lastLocatedIndex: newLastLocatedIndex,
            sequenceFeasible: true
        };
    }, initialProcessingState);

    if (!finalProcessingState.sequenceFeasible) {
        displayResult(-1);
    } else {
        // The result is 1-indexed, so add 1 to the 0-indexed position
        displayResult(finalProcessingState.accumulatedLength + finalProcessingState.lastLocatedIndex + 1);
    }
}

// Ensure the main entry point is named as required by the boilerplate
function Main() {
    findSequencePosition();
}

// The following are stubs for the boilerplate functions,
// as the problem implies they are provided externally and should not be modified/cloned.
// They are included here only to make the generated code runnable in isolation for testing.
/*
var _inputLines = [];
var _lineIndex = 0;
function next() {
    if (_lineIndex < _inputLines.length) {
        return _inputLines[_lineIndex++];
    }
    throw new Error("No more input lines.");
}
function myout(val) {
    console.log(val);
}
*/