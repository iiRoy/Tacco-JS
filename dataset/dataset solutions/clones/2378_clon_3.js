const parseInteger = (inputString) => Number.parseInt(inputString, 10);

function calculateColorCombinations(rawInputContent) {
    const MODULO_PRIME = 1_000_000_007;

    const structuredInputData = rawInputContent.trim().split("\n").map(lineSegment => lineSegment.split(" "));

    const totalElementsCount = parseInteger(structuredInputData[0][0]);

    let currentPermutationState = [1, 0, 0];

    let accumulatedCombinations = 3;

    for (let dataPointIndex = 1; dataPointIndex < totalElementsCount; ++dataPointIndex) {
        const currentDataValue = parseInteger(structuredInputData[1][dataPointIndex]);

        const matchingStateCount = currentPermutationState.filter(stateVal => stateVal === currentDataValue).length;

        accumulatedCombinations = (accumulatedCombinations * matchingStateCount) % MODULO_PRIME;

        const firstMatchingStateIdx = currentPermutationState.findIndex(stateVal => stateVal === currentDataValue);
        if (firstMatchingStateIdx !== -1) {
            currentPermutationState[firstMatchingStateIdx]++;
        }
    }

    const initialDataElementValue = parseInteger(structuredInputData[1][0]);
    if (initialDataElementValue !== 0) {
        accumulatedCombinations = 0;
    }

    console.log(accumulatedCombinations);
}

calculateColorCombinations(require("fs").readFileSync("/dev/stdin", "utf8"));
