function processInputData(rawData) {
    const filteredLines = rawData.split("\n").filter((currentLine, lineIndex) => lineIndex !== 0 && currentLine !== "");
    const numericalValues = filteredLines.map(Number);

    if (numericalValues.length === 0) {
        return;
    }

    if (numericalValues.length === 1) {
        throw new TypeError("Reduce of empty array with no initial value");
    }

    let globalMaximum = -Infinity;
    let secondGlobalMaximum = -Infinity;
    let globalMaximumCount = 0;

    for (const valueEntry of numericalValues) {
        if (valueEntry > globalMaximum) {
            secondGlobalMaximum = globalMaximum;
            globalMaximum = valueEntry;
            globalMaximumCount = 1;
        } else if (valueEntry === globalMaximum) {
            globalMaximumCount++;
        } else if (valueEntry > secondGlobalMaximum) {
            secondGlobalMaximum = valueEntry;
        }
    }

    for (const currentElement of numericalValues) {
        if (currentElement === globalMaximum) {
            if (globalMaximumCount > 1) {
                console.log(globalMaximum);
            } else {
                console.log(secondGlobalMaximum);
            }
        } else {
            console.log(globalMaximum);
        }
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
