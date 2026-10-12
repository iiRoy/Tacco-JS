const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = rawData.trim().split('\n');

var numElementsStr;
var lineIterator = 0;

const ZERO_VAL = 0;
const MOD_DIVISOR = 2;
const ONE_VAL = 1;

while(lineIterator < dataRows.length){
    const currentLineContent = dataRows[lineIterator];

    if((lineIterator % MOD_DIVISOR) === ZERO_VAL){
        if(currentLineContent == ZERO_VAL){
            break;
        }
        numElementsStr = currentLineContent;
        continue;
    } else {
        const parsedNumbers = dataRows.split(' ').map(Number);

        console.log(determineMinimumDifference(parsedNumbers, parseInt(numElementsStr)));
        lineIterator++;
    }
}

function determineMinimumDifference(valueArray, arraySize){

    var calculatedDifference;

    const limitOuter = arraySize - ONE_VAL;
    
    for ( let outerLoopIndex = ZERO_VAL; outerLoopIndex < limitOuter; outerLoopIndex++) {
            const startInnerLoop = outerLoopIndex + ONE_VAL;
            for ( let innerLoopIndex = startInnerLoop; innerLoopIndex < arraySize; innerLoopIndex++) { 
                const currentDiffValue = Math.abs(valueArray[outerLoopIndex] - valueArray[innerLoopIndex]);
                if (currentDiffValue < calculatedDifference) 
                    calculatedDifference = currentDiffValue;
            }
    }

    return calculatedDifference;
}
