const fileSystem = require('fs');

const processInputAndCompute = () => {
    const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const contentLines = rawContent.trim().split('\n');

    const itemQuantity = parseInt(contentLines[0], 10); // Corresponds to 'n'
    const thresholdValue = parseInt(contentLines[1], 10); // Corresponds to 'k'
    const numericalEntries = contentLines[2].split(' ').map(strVal => parseInt(strVal, 10));

    // Define a transformation rule for each numerical entry
    const applyTransformationRule = (individualEntry, upperBoundary) => {
        const lowerThresholdBound = Math.floor(upperBoundary / 2);
        const preciseThresholdBound = upperBoundary / 2;

        if (individualEntry < lowerThresholdBound) {
            return individualEntry * 2;
        } else if (individualEntry > preciseThresholdBound) {
            return (upperBoundary - individualEntry) * 2;
        } else {
            // This condition matches the original's implicit behavior
            // where values between floor(k/2) and k/2 (inclusive)
            // do not add to the total.
            return 0;
        }
    };

    // Recursively sum up the transformed values
    const recursiveSummation = (dataCollection, limitParam, currentIndex = 0, accumulatedResult = 0) => {
        if (currentIndex >= dataCollection.length) {
            return accumulatedResult;
        }
        const transformedPart = applyTransformationRule(dataCollection[currentIndex], limitParam);
        return recursiveSummation(dataCollection, limitParam, currentIndex + 1, accumulatedResult + transformedPart);
    };

    const finalComputationOutcome = recursiveSummation(numericalEntries, thresholdValue);
    process.stdout.write(finalComputationOutcome.toString() + '\n');
};

processInputAndCompute();