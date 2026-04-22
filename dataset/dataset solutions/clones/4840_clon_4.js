const obtainInput = (dataProcessingCallback) => {
    let accumulatedData = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
        accumulatedData += chunk;
    });

    process.stdin.on('end', () => {
        dataProcessingCallback(accumulatedData.trim());
    });
};

const calculateDivisibleOccurrences = (startPoint, endPoint, dividerValue) => {
    if (Number.isNaN(endPoint) || startPoint > endPoint) {
        return 0;
    }

    if (Number.isNaN(dividerValue) || dividerValue === 0) {
        return endPoint - startPoint + 1;
    }
    
    const multiplesUntilEnd = Math.floor(endPoint / dividerValue);
    const multiplesBeforeStart = Math.floor((startPoint - 1) / dividerValue);

    return multiplesUntilEnd - multiplesBeforeStart;
};

const presentOutcome = (finalResult) => {
    process.stdout.write(finalResult.toString() + '\n');
};

obtainInput((completeText) => {
    const numberFragments = completeText.match(/\d+/g);
    
    let firstParameter = Number.NaN;
    let secondParameter = Number.NaN;
    let thirdParameter = Number.NaN;

    if (numberFragments && numberFragments.length > 0) {
        firstParameter = Number(numberFragments[0]);
        if (numberFragments.length > 1) {
            secondParameter = Number(numberFragments[1]);
            if (numberFragments.length > 2) {
                thirdParameter = Number(numberFragments[2]);
            }
        }
    }

    const calculatedValue = calculateDivisibleOccurrences(firstParameter, secondParameter, thirdParameter);
    presentOutcome(calculatedValue);
});