let fullInputAccumulator = '';

process.stdin.on('data', function(receivedChunk) {
    fullInputAccumulator += receivedChunk.toString();
});

process.stdin.on('end', function() {
    let parsedNumericSequence = fullInputAccumulator.trim().split('\n').map(item => Number(item));

    function recursivelyProcessSegments(remainingSequence, outcomeCollection) {
        if (remainingSequence.length === 0) {
            return outcomeCollection;
        }

        let currentSegmentSize = remainingSequence[0];
        if (currentSegmentSize === 0) {
            return outcomeCollection;
        }

        let scoresForCurrentSegment = remainingSequence.slice(1, currentSegmentSize + 1);
        let nextRemainingSequence = remainingSequence.slice(currentSegmentSize + 1);

        let modifiableScores = [...scoresForCurrentSegment];

        // Locate and eliminate the smallest value
        let minimumElement = Math.min(...modifiableScores);
        let minimumElementIndex = modifiableScores.indexOf(minimumElement);
        modifiableScores.splice(minimumElementIndex, 1);

        // Locate and eliminate the largest value from the modified collection
        let maximumElement = Math.max(...modifiableScores);
        let maximumElementIndex = modifiableScores.indexOf(maximumElement);
        modifiableScores.splice(maximumElementIndex, 1);

        function sumElementsRecursively(elements, currentIndex = 0, runningSum = 0) {
            if (currentIndex >= elements.length) {
                return runningSum;
            }
            return sumElementsRecursively(elements, currentIndex + 1, runningSum + elements[currentIndex]);
        }

        let totalForCalculation = sumElementsRecursively(modifiableScores);

        let calculatedAverage;
        if (modifiableScores.length > 0) {
            calculatedAverage = Math.floor(totalForCalculation / modifiableScores.length);
        } else {
            calculatedAverage = 0; 
        }

        outcomeCollection.push(calculatedAverage);

        return recursivelyProcessSegments(nextRemainingSequence, outcomeCollection);
    }

    let finalResultsList = recursivelyProcessSegments(parsedNumericSequence, []);

    finalResultsList.forEach(result => console.log(result));
});