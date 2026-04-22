(async function() {
    const inputReader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const modulusConstant = 10000000007;

    let capturedLines = [];

    inputReader.on('line', (currentLineData) => {
        capturedLines.push(currentLineData);
    });

    inputReader.on('close', () => {
        const itemQuantity = Number(capturedLines[0]);
        const numericalElements = capturedLines[1].split(' ').map(Number);

        const accumulateRangeSum = (sourceArray, startExclusive, endExclusive) => {
            return sourceArray.slice(startExclusive, endExclusive).reduce((total, currentVal) => total + currentVal, 0);
        };

        const calculateProductUpTo = (upperLimit) => {
            if (upperLimit <= 1) {
                return 1;
            }
            return upperLimit * calculateProductUpTo(upperLimit - 1);
        };

        const totalRelevantSum = accumulateRangeSum(numericalElements, 1, itemQuantity);
        const cumulativeProduct = calculateProductUpTo(itemQuantity - 1);

        const intermediateDivision = totalRelevantSum / (itemQuantity - 1);
        const finalResult = (intermediateDivision * cumulativeProduct) % modulusConstant;

        process.stdout.write(String(finalResult) + '\n');
    });
})();