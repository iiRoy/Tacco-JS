const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputTokensArray = rawInputContent.trim().split(/\s+/);

let currentTokenIndex = 0;

function formatNumericCoordinate(valueToFormat) {
    const intermediateScaledValue = valueToFormat * 1000;
    const roundedIntermediateValue = Math.round(intermediateScaledValue);
    const finalRoundedValue = roundedIntermediateValue / 1000;
    return finalRoundedValue.toFixed(3);
}

while (currentTokenIndex < inputTokensArray.length) {
    const a1 = parseFloat(inputTokensArray[currentTokenIndex++]);
    const b1 = parseFloat(inputTokensArray[currentTokenIndex++]);
    const c1 = parseFloat(inputTokensArray[currentTokenIndex++]);
    const a2 = parseFloat(inputTokensArray[currentTokenIndex++]);
    const b2 = parseFloat(inputTokensArray[currentTokenIndex++]);
    const c2 = parseFloat(inputTokensArray[currentTokenIndex++]);

    const mainDeterminant = (b1 * a2) - (a1 * b2);

    const yNumerator = (c1 * a2) - (a1 * c2);

    const solutionForY = yNumerator / mainDeterminant;

    const xNumerator = c1 - (b1 * solutionForY);

    const solutionForX = xNumerator / a1;

    const formattedSolutionX = formatNumericCoordinate(solutionForX);
    const formattedSolutionY = formatNumericCoordinate(solutionForY);

    console.log(formattedSolutionX + " " + formattedSolutionY);
}
