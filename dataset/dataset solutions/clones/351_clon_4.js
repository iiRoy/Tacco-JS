async function acquireInputData() {
    return new Promise((resolve) => {
        let collectedText = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (dataChunk) => {
            collectedText += dataChunk;
        });
        process.stdin.on('end', () => {
            resolve(collectedText.split('\n'));
        });
    });
}

function solveEquationPuzzle(equationText) {
    const normalizedText = equationText.trim();
    if (normalizedText === '') {
        return null; // Signals to skip this line, similar to original's 'return'
    }

    const plusIndex = normalizedText.indexOf('+');
    const equalsIndex = normalizedText.indexOf('=');

    const termAString = normalizedText.substring(0, plusIndex);
    const termBString = normalizedText.substring(plusIndex + 1, equalsIndex);
    const termCString = normalizedText.substring(equalsIndex + 1);

    const possibleDigits = Array.from({ length: 10 }, (_, val) => val);

    const transformAndValue = (expressionPart, numericSubstitute) => {
        const updatedString = expressionPart.split('X').join(String(numericSubstitute));
        return Number(updatedString);
    };

    const foundSolution = possibleDigits.find(testValue => {
        const checkLeadingZero = (partStr) => partStr.charAt(0) === 'X';

        if (testValue === 0 && (checkLeadingZero(termAString) || checkLeadingZero(termBString) || checkLeadingZero(termCString))) {
            return false; // Skip if 0 is a leading digit replacement
        }

        const valueA = transformAndValue(termAString, testValue);
        const valueB = transformAndValue(termBString, testValue);
        const valueC = transformAndValue(termCString, testValue);

        return valueA + valueB === valueC;
    });

    return foundSolution !== undefined ? foundSolution : 'NA';
}

async function orchestrateProcessing() {
    const allInputLines = await acquireInputData();
    allInputLines.forEach(statement => {
        const result = solveEquationPuzzle(statement);
        if (result !== null) { // Only log if it's not a skipped empty line
            console.log(result);
        }
    });
}

orchestrateProcessing();