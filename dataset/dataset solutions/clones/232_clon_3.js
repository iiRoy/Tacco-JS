const fileSystemModule = require('fs');
const fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const trimmedContent = fileContent.trim();
const inputLines = trimmedContent.split("\n");

const HALF_FACTOR = 0.5;

function calculateTriangularComponent(baseNumber) {
    const oneLessThanBase = baseNumber - 1;
    const productOfTerms = baseNumber * oneLessThanBase;
    return HALF_FACTOR * productOfTerms;
}

for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentLineString = inputLines[lineIndex];
    const parsedNumericValue = Number(currentLineString);
    
    const currentNumberPlusOne = parsedNumericValue + 1;
    
    const intermediateResult = calculateTriangularComponent(currentNumberPlusOne);
    
    console.log(intermediateResult + 1);
}
