const processInputData = (rawData) => {
    const dataTokens = rawData.split(/\s+/).filter(Boolean);
    let tokenCursor = 0;

    const extractInteger = () => parseInt(dataTokens[tokenCursor++], 10);

    const extractIntegerSequence = (quantity) => {
        const sequence = new Array(quantity);
        for (let i = 0; i < quantity; i++) {
            sequence[i] = extractInteger();
        }
        return sequence;
    };

    const elementCount = extractInteger();
    const numericalValues = extractIntegerSequence(elementCount);

    return { elementCount, numericalValues };
};

function ProcessNumericalArray(rawInputText) {
    const { elementCount: initialSize, numericalValues: dataArray } = processInputData(rawInputText);

    dataArray.sort((valA, valB) => valB - valA); // Sort in descending order

    dataArray.push(0); // Append a zero for consistent boundary handling

    const primaryElement = dataArray[0];
    const targetMidpoint = Math.floor(primaryElement / 2);

    // Use Array.prototype.reduce to determine the two candidate values.
    // The accumulator holds the current best pair [candidateA, candidateB].
    // We iterate over indices from 1 up to (initialSize - 1),
    // which corresponds to the 'n' loop in the original logic.
    const [candidateA, candidateB] = Array.from({ length: initialSize - 1 }, (_, index) => index + 1)
        .reduce((currentPair, currentIndex) => {
            // If the current element in the sorted array is greater than or equal to the target midpoint,
            // update the candidates to the current element and the one immediately following it.
            if (targetMidpoint <= dataArray[currentIndex]) {
                return [dataArray[currentIndex], dataArray[currentIndex + 1]];
            }
            // Otherwise, retain the previously established candidates.
            return currentPair;
        }, [0, 0]); // Initialize candidates to [0, 0]

    // Select the candidate that is closer to the target midpoint.
    const chosenCandidate = (Math.abs(targetMidpoint - candidateA) <= Math.abs(targetMidpoint - candidateB))
        ? candidateA
        : candidateB;

    console.log(`${primaryElement} ${chosenCandidate}`);
}

if (typeof window === "undefined") {
    ProcessNumericalArray(require("fs").readFileSync("/dev/stdin", "utf8"));
}
