function processInputAndCalculate(inputString) {
    const [firstLineData, secondLineData] = inputString.split('\n');

    const [totalElements, windowLength] = firstLineData.split(' ').map(Number);
    const numericSequence = secondLineData.split(' ').map(Number);

    const transformedSequences = Array.from({ length: totalElements - windowLength + 1 }, (_, currentIndex) => {
        const segmentToSort = numericSequence.slice(currentIndex, currentIndex + windowLength);
        const sortedSegment = [...segmentToSort].sort((valA, valB) => valA - valB);

        const reconstructedArray = [
            ...numericSequence.slice(0, currentIndex),
            ...sortedSegment,
            ...numericSequence.slice(currentIndex + windowLength)
        ];
        return reconstructedArray.join(',');
    });

    const uniqueSequenceTracker = new Map();
    transformedSequences.forEach(sequenceString => uniqueSequenceTracker.set(sequenceString, true));

    console.log(uniqueSequenceTracker.size);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
