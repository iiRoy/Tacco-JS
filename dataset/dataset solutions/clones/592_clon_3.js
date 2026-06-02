const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileContent.trim().split("\n");
const SUBSEQUENT_VALUE_COUNT = 10;

for (let mainIdx = 0; mainIdx < dataLines.length; mainIdx++) {
    const currentLineNumericValue = Number(dataLines[mainIdx]);
    
    if (currentLineNumericValue === 0) {
        break;
    }
    
    let accumulatedSubsequentSum = 0;
    for (let offsetIdx = 0; offsetIdx < SUBSEQUENT_VALUE_COUNT; offsetIdx++) {
        const subsequentLineString = dataLines[mainIdx + offsetIdx + 1];
        const subsequentLineNumeric = Number(subsequentLineString);
        accumulatedSubsequentSum += subsequentLineNumeric;
    }
    
    const calculatedDifference = currentLineNumericValue - accumulatedSubsequentSum;
    console.log(calculatedDifference);
    
    mainIdx += SUBSEQUENT_VALUE_COUNT;
}
