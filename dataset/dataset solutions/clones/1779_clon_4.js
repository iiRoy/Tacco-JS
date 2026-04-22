(function() {
    const acquireNumericSequence = (dataSourceText) => {
        const textualSegments = dataSourceText.trim().split('\n');
        return textualSegments[1].split(' ').map(Number);
    };

    const generateFrequencyRegistry = (dataUnits) => {
        const countRegistry = new Map();
        for (const item of dataUnits) {
            countRegistry.set(item, (countRegistry.get(item) || 0) + 1);
        }
        return countRegistry;
    };

    const computeNonDivisibleUniqueCount = (initialNumericCollection) => {
        const valueOccurrences = generateFrequencyRegistry(initialNumericCollection);
        
        const sortedUniqueElements = Array.from(new Set(initialNumericCollection)).sort((x, y) => x - y);

        const eligibleMembers = sortedUniqueElements.filter(currentValue => {
            const isSingularOccurrence = valueOccurrences.get(currentValue) === 1;
            if (!isSingularOccurrence) {
                return false; 
            }

            const isMultipleOfSmallerDistinct = sortedUniqueElements.some(potentialDivisor =>
                potentialDivisor < currentValue && currentValue % potentialDivisor === 0
            );

            return !isMultipleOfSmallerDistinct;
        });

        return eligibleMembers.length;
    };

    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const processedInputNumbers = acquireNumericSequence(rawInputContent);
    const finalCalculatedQuantity = computeNonDivisibleUniqueCount(processedInputNumbers);

    console.log(`${finalCalculatedQuantity}`);
})();