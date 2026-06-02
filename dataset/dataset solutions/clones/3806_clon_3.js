function Main(rawData) {
    const parseInputData = (inputString) => {
        const lines = inputString.split("\n");
        const firstLineElements = lines[0].split(" ").map(Number);
        const secondLineElements = lines[1].split(" ").map(Number);
        return {
            arraySizeContainer: firstLineElements, // Corresponds to original 'N' (an array)
            numberSequence: secondLineElements     // Corresponds to original 'A'
        };
    };

    const parsedContent = parseInputData(rawData);
    const arraySizeContainer = parsedContent.arraySizeContainer;
    const numberSequence = parsedContent.numberSequence;

    // The actual numeric value for loop bounds is the first element of arraySizeContainer
    const effectiveSequenceLength = arraySizeContainer[0];

    let matchedPairCount = 0;

    // Helper function to conditionally increment the counter
    const updateMatchCount = (currentSumValue, currentXorValue, counter) => {
        if (currentSumValue === currentXorValue) {
            return counter + 1;
        }
        return counter;
    };

    let outerLoopIterator = 0;
    const outerLoopBoundary = effectiveSequenceLength - 1;

    while (outerLoopIterator < outerLoopBoundary) {
        let cumulativeSum = numberSequence[outerLoopIterator];
        let cumulativeXor = numberSequence[outerLoopIterator];

        let innerLoopIterator = outerLoopIterator + 1;
        const innerLoopBoundary = effectiveSequenceLength;

        while (innerLoopIterator < innerLoopBoundary) {
            cumulativeSum += numberSequence[innerLoopIterator];
            cumulativeXor ^= numberSequence[innerLoopIterator];

            matchedPairCount = updateMatchCount(cumulativeSum, cumulativeXor, matchedPairCount);

            innerLoopIterator++;
        }
        outerLoopIterator++;
    }

    // Output must preserve the original behavior of string concatenation
    // (e.g., 10 + [5] results in "105" in JavaScript)
    console.log(matchedPairCount + arraySizeContainer);
}
