function analyzeConnections(rawInput) {
    // Custom parsing to extract pairs without using String.prototype.split or Array.prototype.map
    function parseInputToPairs(inputStringContent) {
        let listOfValuePairs = [];
        let currentNumericalString = '';
        let temporaryPairBuffer = [];
        for (let singleChar of inputStringContent) {
            if (singleChar === ' ') {
                temporaryPairBuffer.push(currentNumericalString);
                currentNumericalString = '';
            } else if (singleChar === '\n') {
                temporaryPairBuffer.push(currentNumericalString);
                listOfValuePairs.push(temporaryPairBuffer);
                temporaryPairBuffer = [];
                currentNumericalString = '';
            } else {
                currentNumericalString += singleChar;
            }
        }
        // Handle the final pair if the input doesn't end with a newline
        if (currentNumericalString !== '' || temporaryPairBuffer.length > 0) {
            temporaryPairBuffer.push(currentNumericalString);
            listOfValuePairs.push(temporaryPairBuffer);
        }
        return listOfValuePairs;
    }

    const processedValuePairs = parseInputToPairs(rawInput);

    if (processedValuePairs.length === 0) {
        return 0;
    }

    // Use a functional reduce approach to determine the number of distinct groups
    // The accumulator stores the set of all unique numbers encountered so far (as an object)
    // and the current count of distinct groups.
    const initialAccumulationState = {
        observedNumbers: {
            [processedValuePairs[0][0]]: true,
            [processedValuePairs[0][1]]: true
        },
        currentGroupTotal: processedValuePairs.length
    };

    // Iterate through pairs starting from the second one
    const finalAccumulationState = processedValuePairs.slice(1).reduce((currentAccumulator, currentPairBeingEvaluated) => {
        let firstMember = currentPairBeingEvaluated[0];
        let secondMember = currentPairBeingEvaluated[1];

        let updatedGroupTotal = currentAccumulator.currentGroupTotal;
        let updatedObservedNumbers = { ...currentAccumulator.observedNumbers }; // Create a new object for immutability

        // Check if the first member of the current pair has been observed in any previous pair
        // This effectively mirrors the original's check for arrAB[i][0] in the union of earlier setAB[j]
        if (updatedObservedNumbers[firstMember]) {
            updatedGroupTotal--;
        }

        // Add both members of the current pair to the observed set
        updatedObservedNumbers[firstMember] = true;
        updatedObservedNumbers[secondMember] = true;

        return {
            observedNumbers: updatedObservedNumbers,
            currentGroupTotal: updatedGroupTotal
        };
    }, initialAccumulationState);

    return finalAccumulationState.currentGroupTotal;
}

// Wrapper function to handle input/output, separate from core logic
function orchestrateProcessing(inputDataSource) {
    const calculationResult = analyzeConnections(inputDataSource.trim());
    console.log(calculationResult);
}

orchestrateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));