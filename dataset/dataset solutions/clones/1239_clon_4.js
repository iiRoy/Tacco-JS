process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingData) {
    const numericComponents = incomingData.toString().trim().split(/\s+/).map(x => Number.parseInt(x, 10));

    const lowerBoundary = numericComponents[0];
    const upperBoundary = numericComponents[1];
    const principalValue = numericComponents[2];

    function calculateOccurrences(currentPosition, endPosition, subjectValue, accumulatedCount) {
        if (currentPosition >= endPosition) {
            return accumulatedCount;
        }

        const newAccumulatedCount = (subjectValue % currentPosition === 0) ? accumulatedCount + 1 : accumulatedCount;

        return calculateOccurrences(currentPosition + 1, endPosition, subjectValue, newAccumulatedCount);
    }

    const totalOccurrences = calculateOccurrences(lowerBoundary, upperBoundary, principalValue, 0);

    console.log(totalOccurrences);
});