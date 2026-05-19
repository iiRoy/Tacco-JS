(function(rawInputData) {
    const inputLines = rawInputData.split('\n');

    function calculateArithmeticMean(dataSet) {
        if (dataSet.length === 0) {
            return NaN;
        }
        let totalSum = 0;
        for (const dataPoint of dataSet) {
            totalSum += dataPoint;
        }
        return totalSum / dataSet.length;
    }

    function computePopulationVariance(dataSet) {
        if (dataSet.length === 0) {
            return NaN;
        }
        const averageValue = calculateArithmeticMean(dataSet);
        let accumulatedSquaredDifferences = 0;
        for (const dataPoint of dataSet) {
            const deviation = dataPoint - averageValue;
            accumulatedSquaredDifferences += Math.pow(deviation, 2);
        }
        return accumulatedSquaredDifferences / dataSet.length;
    }

    function determineStandardDeviation(dataSet) {
        const populationVariance = computePopulationVariance(dataSet);
        return Math.sqrt(populationVariance);
    }

    function processNextTestCase() {
        const countString = inputLines.shift();
        const currentCount = Number(countString);

        if (currentCount === 0) {
            return false;
        }

        const numbersLine = inputLines.shift();
        
        const parsedParts = [];
        let remainingString = numbersLine;
        const splitLimit = currentCount;

        for (let i = 0; i < splitLimit - 1; i++) {
            const spacePosition = remainingString.indexOf(' ');
            if (spacePosition === -1) {
                parsedParts.push(remainingString);
                remainingString = '';
                break;
            }
            parsedParts.push(remainingString.substring(0, spacePosition));
            remainingString = remainingString.substring(spacePosition + 1);
        }
        
        if (remainingString.length > 0 || parsedParts.length < splitLimit) {
             parsedParts.push(remainingString);
        }
        
        const numericData = parsedParts.map(Number);

        console.log(determineStandardDeviation(numericData));
        return true;
    }

    while (processNextTestCase()) {
        // Continue processing test cases until processNextTestCase returns false (currentCount is 0).
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
