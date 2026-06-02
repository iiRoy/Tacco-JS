const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedInput = rawData.trim();

const inputLines = processedInput.split("\n");

function solveLinearSystem(paramA, paramB, paramC, paramD, paramE, paramF) {
    const xNumeratorTerm1 = paramC * paramE;
    const xNumeratorTerm2 = paramF * paramB;
    const xNumerator = xNumeratorTerm1 - xNumeratorTerm2;

    const xDenominatorTerm1 = paramE * paramA;
    const xDenominatorTerm2 = paramD * paramB;
    const xDenominator = xDenominatorTerm1 - xDenominatorTerm2;

    const solutionForX = xNumerator / xDenominator;

    const yNumeratorTerm1 = paramC;
    const yNumeratorTerm2 = paramA * solutionForX;
    const yNumerator = yNumeratorTerm1 - yNumeratorTerm2;

    const solutionForY = yNumerator / paramB;

    return [solutionForX, solutionForY];
}

inputLines.forEach(function(currentLine) {
    const numValues = currentLine.split(" ").map(Number);

    const coeffA = numValues[0];
    const coeffB = numValues[1];
    const coeffC = numValues[2];
    const coeffD = numValues[3];
    const coeffE = numValues[4];
    const coeffF = numValues[5];

    const [resultX, resultY] = solveLinearSystem(coeffA, coeffB, coeffC, coeffD, coeffE, coeffF);

    console.log([resultX, resultY].join(" "));
});
