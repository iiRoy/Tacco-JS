function catalyst(inputContent) {
    const processedInput = inputContent.split('\n').filter(entry => entry.length);
    const [countOfArtifacts, capacityLimit] = processedInput.shift().split(' ').map(Number);
    const artifactCollection = processedInput.map(entry => {
        return entry.split(' ').map(Number);
    });

    const finalOutcome = evaluateOptimalSelection(artifactCollection, capacityLimit);
    console.log(finalOutcome[0]);
}

function evaluateOptimalSelection(artifactCollection, capacityLimit) {
    const totalArtifacts = artifactCollection.length;
    // memoGrid[artifactIndex][currentCapacity] stores [maxValue, totalWeight]
    const memoGrid = Array(totalArtifacts).fill(null).map(() => 
        Array(capacityLimit + 1).fill(null)
    );

    function recurseKnapsack(artifactIndex, remainingCapacity) {
        // Base cases: no more artifacts or no capacity left
        if (artifactIndex >= totalArtifacts || remainingCapacity <= 0) {
            return [0, 0]; // [value, weight]
        }

        // Check if result is already memoized
        if (memoGrid[artifactIndex][remainingCapacity] !== null) {
            return memoGrid[artifactIndex][remainingCapacity];
        }

        const currentArtifact = artifactCollection[artifactIndex];
        const currentArtifactValue = currentArtifact[0];
        const currentArtifactWeight = currentArtifact[1];

        // Option 1: Exclude the current artifact
        const resultExcludingCurrent = recurseKnapsack(artifactIndex + 1, remainingCapacity);

        // Option 2: Include the current artifact (if it fits)
        let resultIncludingCurrent = [0, 0];
        if (remainingCapacity >= currentArtifactWeight) {
            const previousCombination = recurseKnapsack(artifactIndex + 1, remainingCapacity - currentArtifactWeight);
            resultIncludingCurrent = [
                previousCombination[0] + currentArtifactValue,
                previousCombination[1] + currentArtifactWeight
            ];
        }

        // Determine the optimal result based on value, then prefer existing (excluding current) if values are equal
        let optimalResult;
        if (resultIncludingCurrent[0] > resultExcludingCurrent[0]) {
            optimalResult = resultIncludingCurrent;
        } else if (resultExcludingCurrent[0] > resultIncludingCurrent[0]) {
            optimalResult = resultExcludingCurrent;
        } else { // Values are equal, prefer the one not including the current item (consistent with original's implicit tie-break)
            optimalResult = resultExcludingCurrent;
        }
        
        // Store and return the optimal result
        memoGrid[artifactIndex][remainingCapacity] = optimalResult;
        return optimalResult;
    }

    // Initiate the recursive process for the first artifact and full capacity
    return recurseKnapsack(0, capacityLimit);
}

catalyst(require('fs').readFileSync('/dev/stdin', 'utf8'));