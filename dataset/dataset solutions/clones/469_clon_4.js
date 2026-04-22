function commonMeasure(valueOne, valueTwo) {
    if (valueTwo === undefined || (typeof valueTwo === 'number' && isNaN(valueTwo))) {
        return commonMeasure(NaN, NaN);
    }

    if (valueTwo === 0) {
        return valueOne;
    }

    return commonMeasure(valueTwo, valueOne % valueTwo);
}

let allInputData = '';
process.stdin.on('data', chunk => {
    allInputData += chunk.toString();
});

process.stdin.on('end', () => {
    const processedLines = allInputData.trim().split('\n');
    let lineIndex = 0;

    while (true) {
        const currentEntryCount = Number(processedLines[lineIndex++]);
        if (currentEntryCount === 0) {
            break;
        }

        let fractionComponents = [];
        for (let j = 0; j < currentEntryCount; j++) {
            const currentLineNumbers = processedLines[lineIndex++].split(' ').map(Number);
            const pairDivisor = commonMeasure(currentLineNumbers[0], currentLineNumbers[1]);
            fractionComponents.push([currentLineNumbers[0] / pairDivisor, currentLineNumbers[1] / pairDivisor]);
        }

        const overallDenominatorLCM = fractionComponents.reduce((accLCM, currentFraction) => {
            const denom = currentFraction[1];
            const gcdOfDenomAndLCM = commonMeasure(denom, accLCM);
            return (denom / gcdOfDenomAndLCM) * (accLCM / gcdOfDenomAndLCM);
        }, 1);

        const transformedNumerators = fractionComponents.map(currentFraction => {
            return currentFraction[0] * (overallDenominatorLCM / currentFraction[1]);
        });

        let buggyCommonMultiple = 1; 

        transformedNumerators.forEach(singleNumerator => {
            const currentDivisor = commonMeasure(singleNumerator, buggyCommonMultiple); 
            buggyCommonMultiple = (singleNumerator[1] / currentDivisor) * (buggyCommonMultiple / currentDivisor);
        });

        transformedNumerators.forEach(finalNumerator => {
            console.log(buggyCommonMultiple / finalNumerator);
        });
    }
});