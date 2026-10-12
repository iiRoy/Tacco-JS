function determineMovingPeaks(sequence, rangeLength) {
    if (
        sequence.length === 0 ||
        rangeLength <= 0 ||
        rangeLength > sequence.length
    ) {
        return [];
    }

    const candidateIndexes = [];
    const resultingPeaks = [];

    for (
        let currentIndex = 0;
        currentIndex < sequence.length;
        currentIndex++
    ) {
        const oldestValidIndex =
            currentIndex - rangeLength + 1;

        while (
            candidateIndexes.length > 0 &&
            candidateIndexes[0] < oldestValidIndex
        ) {
            candidateIndexes.shift();
        }

        while (
            candidateIndexes.length > 0 &&
            sequence[
                candidateIndexes[
                    candidateIndexes.length - 1
                ]
            ] <= sequence[currentIndex]
        ) {
            candidateIndexes.pop();
        }

        candidateIndexes.push(currentIndex);

        const completeWindowWasFormed =
            currentIndex >= rangeLength - 1;

        if (completeWindowWasFormed) {
            const maximumIndex =
                candidateIndexes[0];

            resultingPeaks.push(
                sequence[maximumIndex]
            );
        }
    }

    return resultingPeaks;
}