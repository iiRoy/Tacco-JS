function fetchInteger(textualRepresentation) {
    return Number(textualRepresentation);
}

function repositionChars(originalString, shiftCount) {
    const stringLength = originalString.length;
    if (stringLength === 0 || shiftCount === 0) {
        return originalString;
    }
    const effectiveShift = shiftCount % stringLength;
    let shiftedResult = '';
    for (let currentPos = 0; currentPos < stringLength; currentPos++) {
        shiftedResult += originalString.charAt((currentPos + effectiveShift) % stringLength);
    }
    return shiftedResult;
}

function displayResult(finalOutput) {
    console.log(finalOutput);
}

function performShuffling(sourceData) {
    const dataSegments = sourceData.split('\n');
    const processedUnits = [];
    let currentUnit = null;

    for (const unitText of dataSegments) {
        if (unitText === '-') {
            if (currentUnit !== null) {
                processedUnits.push(currentUnit);
            }
            break; 
        }

        const numericalInterpretation = fetchInteger(unitText);
        const isNumericalEntry = !isNaN(numericalInterpretation);

        if (isNumericalEntry) {
            if (currentUnit === null) {
                currentUnit = { startSequence: '', shiftCounts: [] };
            }
            currentUnit.shiftCounts.push(numericalInterpretation);
        } else {
            if (currentUnit !== null) {
                processedUnits.push(currentUnit);
            }
            currentUnit = { startSequence: unitText, shiftCounts: [] };
        }
    }

    for (const unit of processedUnits) {
        let activeSequence = unit.startSequence;
        for (const shiftVal of unit.shiftCounts) {
            activeSequence = repositionChars(activeSequence, shiftVal);
        }
        displayResult(activeSequence);
    }
}

// Standard input handling for Node.js environment
const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
performShuffling(inputSource);