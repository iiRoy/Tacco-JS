const acquireInput = () => {
    return new Promise(resolve => {
        let capturedData = '';
        process.stdin.on('data', chunk => {
            capturedData += chunk.toString();
        });
        process.stdin.on('end', () => {
            const firstLine = capturedData.trim().split('\n')[0];
            const numericalValue = parseInt(firstLine, 10);
            resolve(numericalValue);
        });
        process.stdin.on('error', err => {
            console.error('Input acquisition failure:', err);
            resolve(null);
        });
    });
};

const determineFactor = (sourceValue, currentCandidate, thresholdMagnitude) => {
    const checkCondition = (sourceValue % currentCandidate === 0) &&
                                     (sourceValue / currentCandidate >= thresholdMagnitude);

    if (!checkCondition) {
        return currentCandidate;
    } else {
        return determineFactor(sourceValue, currentCandidate + 1, thresholdMagnitude);
    }
};

acquireInput().then(originalNumber => {
    if (originalNumber === null) {
        return;
    }

    const constantValue = 1000000000;
    
    const finalDivisor = determineFactor(originalNumber, 1, constantValue);

    const precedingDivisor = finalDivisor - 1;
    let calculatedQuotient;

    if (precedingDivisor === 0) {
        calculatedQuotient = originalNumber / precedingDivisor; 
    } else {
        calculatedQuotient = originalNumber / precedingDivisor;
    }

    const resultingString = `0 0 ${finalDivisor} 0 0 ${calculatedQuotient}\n`;
    process.stdout.write(resultingString);
});