const fileSystemModule = require('fs');

const inputFilePath = '/dev/stdin';

const rawInputData = fileSystemModule.readFileSync(inputFilePath, 'utf8');

const lineEntries = rawInputData.split('\n');

let finalOutputCollection = [];

const terminationSymbol = '?';

for (let currentLineIndex = 0; currentLineIndex < lineEntries.length; currentLineIndex++) {
    const activeLine = lineEntries[currentLineIndex];

    // Trim the line to handle potential leading/trailing whitespace before splitting.
    const trimmedLine = activeLine.trim();
    if (trimmedLine.length === 0) {
        // Skip empty lines or lines containing only whitespace.
        continue;
    }

    const lineComponents = trimmedLine.split(' ');

    // Ensure we have at least three components: operand1, operator, operand2.
    if (lineComponents.length < 3) {
        // Malformed line, skip it.
        continue;
    }

    const firstNumericalValue = Number(lineComponents[0]);
    const operatorCharacter = lineComponents[1];
    const secondNumericalValue = Number(lineComponents[2]);

    if (operatorCharacter === terminationSymbol) {
        // Encountered the termination signal, stop processing further lines.
        break;
    }

    let calculatedResult;

    switch (operatorCharacter) {
        case '+':
            calculatedResult = firstNumericalValue + secondNumericalValue;
            break;
        case '-':
            calculatedResult = firstNumericalValue - secondNumericalValue;
            break;
        case '*':
            calculatedResult = firstNumericalValue * secondNumericalValue;
            break;
        case '/':
            // Perform integer division as per the original's Math.floor.
            calculatedResult = Math.floor(firstNumericalValue / secondNumericalValue);
            break;
        default:
            // If an unrecognized operator, treat as no operation for this line.
            // The original code implicitly skipped, so we do too by not pushing a result.
            calculatedResult = null; // Use null to signify no valid result for this line
            break;
    }

    if (calculatedResult !== null) {
        finalOutputCollection.push(calculatedResult);
    }
}

// Join all collected results with newline characters.
// The `trim()` from the original is effectively handled by filtering empty lines and
// `filter`ing invalid results, then `join`ing.
console.log(finalOutputCollection.join('\n'));