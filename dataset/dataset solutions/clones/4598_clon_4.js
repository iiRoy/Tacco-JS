const Toolbox = {
    convertToInt: (textValue) => Number.parseInt(textValue, 10),
    convertToFloat: (textValue) => Number.parseFloat(textValue),

    orderElementsAsc: (dataArray, typeIndicator = 'text') => {
        const tempCopy = [...dataArray];
        if (typeIndicator === 'numeric') {
            return tempCopy.sort((valX, valY) => valX - valY);
        }
        return tempCopy.sort();
    },

    orderElementsDesc: (dataArray, typeIndicator = 'text') => {
        const tempCopy = [...dataArray];
        if (typeIndicator === 'numeric') {
            return tempCopy.sort((valX, valY) => valY - valX);
        }
        return tempCopy.sort().reverse();
    },

    pruneSpecific: (dataArray, itemToRemove) => {
        return dataArray.filter(currentElement => currentElement !== itemToRemove);
    }
};

const InputManager = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let gatheredRawLines = [];

InputManager.on('line', (incomingRowText) => {
    gatheredRawLines.push(incomingRowText.trim());
});

InputManager.on('close', () => {
    if (gatheredRawLines.length > 0 && gatheredRawLines[gatheredRawLines.length - 1] === '') {
        gatheredRawLines.pop();
    }
    commenceAnalysis(gatheredRawLines);
});

function commenceAnalysis(processedDataUnits) {
    const primarySourceText = processedDataUnits[0]; // This can be undefined

    const parsedConstituents = [];
    let currentScanPosition = 0;

    // Manual string splitting to diverge from String.prototype.split()
    if (primarySourceText !== undefined) {
        while (true) {
            const spaceOccurrence = primarySourceText.indexOf(' ', currentScanPosition);
            if (spaceOccurrence === -1) {
                parsedConstituents.push(primarySourceText.substring(currentScanPosition));
                break;
            }
            parsedConstituents.push(primarySourceText.substring(currentScanPosition, spaceOccurrence));
            currentScanPosition = spaceOccurrence + 1;
        }
    } else {
        // If primarySourceText is undefined, parsedConstituents remains empty
        // This will lead to undefined access below, matching original error behavior
    }

    const componentAlpha = parsedConstituents[0];
    const componentBeta = parsedConstituents[1];
    const componentGamma = parsedConstituents[2];

    // Using String.prototype.at() for character access to diverge from direct indexing
    // and correctly handle out-of-bounds/empty string cases (returns undefined)
    const finalCharAlpha = componentAlpha.at(-1);
    const initialCharBeta = componentBeta.at(0);
    const finalCharBeta = componentBeta.at(-1);
    const initialCharGamma = componentGamma.at(0);

    const conditionMetA = (finalCharAlpha === initialCharBeta);
    const conditionMetB = (finalCharBeta === initialCharGamma);

    const decisionOutput = (conditionMetA && conditionMetB) ? "YES" : "NO";
    process.stdout.write(decisionOutput + "\n");
}