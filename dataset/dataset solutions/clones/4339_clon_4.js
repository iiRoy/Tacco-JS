function valueAsNumber(val) {
    return Number(val);
}

function outputDecision(outcome) {
    console.log(outcome);
}

function processSource(rawData) {
    const lines = rawData.split('\n');
    const firstLineParts = lines[0].split(' ');

    const firstDimension = valueAsNumber(firstLineParts[0]);
    const secondDimension = valueAsNumber(firstLineParts[1]);

    if (secondDimension === 1) {
        outputDecision('Yes');
        return;
    }

    const symbolFrequencies = new Map();
    for (let currentLineIndex = 1; currentLineIndex < lines.length; ++currentLineIndex) {
        const currentLine = lines[currentLineIndex];
        for (let charIndex = 0; charIndex < currentLine.length; ++charIndex) {
            const currentSymbol = currentLine[charIndex];
            symbolFrequencies.set(currentSymbol, (symbolFrequencies.get(currentSymbol) || 0) + 1);
        }
    }

    const firstDimParity = firstDimension & 1;
    const secondDimParity = secondDimension & 1;

    if (firstDimParity === 0 && secondDimParity === 0) {
        let hasNonQuadrupleCount = false;
        for (const count of symbolFrequencies.values()) {
            if ((count & 3) !== 0) {
                hasNonQuadrupleCount = true;
                break;
            }
        }
        if (!hasNonQuadrupleCount) {
            outputDecision('Yes');
        } else {
            outputDecision('No');
        }
    } else if (firstDimParity === 1 && secondDimParity === 1) {
        let sumOfNonQuadrupleCounts = 0;
        for (const count of symbolFrequencies.values()) {
            if ((count & 3) !== 0) {
                sumOfNonQuadrupleCounts += count;
            }
        }
        if ((sumOfNonQuadrupleCounts & 1) === 1) {
            outputDecision('Yes');
        } else {
            outputDecision('No');
        }
    } else {
        outputDecision('No');
    }
}

processSource(require("fs").readFileSync("/dev/stdin", "utf8"));