function processConditions(totalElements, initialXORSum, numericElements, controlSequence) {
    const sequenceLength = totalElements;
    const stateRepository = new Array(sequenceLength + 1);

    // Initialize the base case: when no elements remain (index 'sequenceLength'),
    // only an XOR sum of 0 is considered 'achievable' to result in a final 0.
    stateRepository[sequenceLength] = new Map([[0, true]]);

    // Iterate backwards through the elements, building up the achievable XOR sums.
    // currentSegmentIndex corresponds to 'k' in A[k] and S[k].
    for (let currentSegmentIndex = sequenceLength - 1; currentSegmentIndex >= 0; currentSegmentIndex--) {
        const currentNumericalValue = Number(numericElements[currentSegmentIndex]);
        const currentControlCharacter = controlSequence[currentSegmentIndex];
        const nextSegmentStates = stateRepository[currentSegmentIndex + 1]; // States from the next segment (k+1)
        const currentSegmentStates = new Map(); // States for the current segment (k)

        if (currentControlCharacter === '0') {
            // 'OR' condition: If 'xorVal' OR 'xorVal ^ currentNumericalValue' was achievable from the next segment,
            // then 'xorVal' is achievable from the current segment.
            // This means we are expanding the set of reachable XOR sums.
            for (const xorVal of nextSegmentStates.keys()) {
                currentSegmentStates.set(xorVal, true);
                currentSegmentStates.set(xorVal ^ currentNumericalValue, true);
            }
        } else { // currentControlCharacter === '1'
            // 'AND' condition: If 'xorVal' AND 'xorVal ^ currentNumericalValue' were both achievable from the next segment,
            // then 'xorVal' is achievable from the current segment.
            // This means we are filtering the set of reachable XOR sums.
            for (const xorVal of nextSegmentStates.keys()) {
                if (nextSegmentStates.has(xorVal ^ currentNumericalValue)) {
                    currentSegmentStates.set(xorVal, true);
                }
            }
        }
        stateRepository[currentSegmentIndex] = currentSegmentStates;
    }

    // The original problem asks if an initial XOR sum of 0 can be 'zeroed out'
    // by processing all 'totalElements' (from index 0 to sequenceLength-1).
    // This corresponds to checking if 0 is present in the states for the first segment.
    return stateRepository[0].has(0);
}

function orchestrateExecution(rawInputData) {
    const inputLines = rawInputData.split('\n');
    let lineCursor = 0;
    const totalTestCases = Number(inputLines[lineCursor++]);
    const outputResults = [];

    for (let caseIterator = 0; caseIterator < totalTestCases; caseIterator++) {
        const currentCaseLength = Number(inputLines[lineCursor++]);
        const currentCaseNumericArray = inputLines[lineCursor++].split(' ').map(Number);
        const currentCaseControlString = inputLines[lineCursor++];

        const outcome = processConditions(currentCaseLength, 0, currentCaseNumericArray, currentCaseControlString);
        outputResults.push(outcome ? '0' : '1');
    }
    console.log(outputResults.join('\n'));
}

orchestrateExecution(require("fs").readFileSync("/dev/stdin", "utf8"));