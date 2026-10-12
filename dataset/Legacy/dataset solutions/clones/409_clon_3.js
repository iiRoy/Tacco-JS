const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
let rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
let inputLineSegments = rawInputContent.trim().split("\n");

// Helper function to parse an item string array into a structured array
const parseItemDetails = (itemStringArray) => {
    return [itemStringArray[0], Number(itemStringArray[1]), Number(itemStringArray[2])];
};

// Helper function for sorting items by their second numerical value in descending order
const compareItemsBySecondValueDesc = (itemA, itemB) => itemB[1] - itemA[1];

// Helper function to format the final output sequence
const formatResultSequence = (sequenceString, dataCollection) => {
    return sequenceString.split("")
                         .map(charIndex => dataCollection[Number(charIndex)][0])
                         .reverse()
                         .join("\n");
};

while (true) {
    let currentItemCount = Number(inputLineSegments.shift());
    if (currentItemCount === 0) {
        break;
    }

    let itemDataRecords = [];
    for (let i = 0; i < currentItemCount; i++) {
        let parts = inputLineSegments.shift().split(" ");
        itemDataRecords.push(parseItemDetails(parts));
    }

    itemDataRecords.sort(compareItemsBySecondValueDesc);

    let maximumRatioFound = 0;
    let optimalSequenceString = "";

    // Recursive function to explore combinations and find the optimal sequence
    const exploreCombinations = (currentPathIndicesString, remainingCandidateIndices, currentAccumulatedWeight, currentWeightedSum) => {
        if (remainingCandidateIndices.length === 0) {
            // Only update if a valid sum is achieved to avoid division by zero or NaN
            if (currentAccumulatedWeight > 0) {
                const calculatedRatio = currentWeightedSum / currentAccumulatedWeight;
                if (maximumRatioFound < calculatedRatio) {
                    optimalSequenceString = currentPathIndicesString;
                    maximumRatioFound = calculatedRatio;
                }
            }
            return;
        }

        for (let k = 0; k < remainingCandidateIndices.length; k++) {
            const currentCandidateIndex = remainingCandidateIndices[k];
            const candidateItemWeight = itemDataRecords[currentCandidateIndex][1];
            const candidateItemCapacity = itemDataRecords[currentCandidateIndex][2];

            // Check the capacity constraint
            if (currentAccumulatedWeight <= candidateItemCapacity) {
                const nextPathString = currentPathIndicesString + currentCandidateIndex;
                
                // Create a new array of remaining candidates, excluding the current one
                const nextRemainingCandidates = remainingCandidateIndices.filter(
                    (idx) => idx !== currentCandidateIndex
                );
                
                const nextAccumulatedWeight = currentAccumulatedWeight + candidateItemWeight;
                
                // Calculate the factor for the weighted sum based on path length
                const pathLengthMultiplier = currentPathIndicesString.length + 1;
                const nextWeightedSum = currentWeightedSum + (candidateItemWeight * pathLengthMultiplier);

                exploreCombinations(nextPathString, nextRemainingCandidates, nextAccumulatedWeight, nextWeightedSum);
            }
        }
    };

    let initialCandidateIndicesList = [];
    for (let i = 0; i < currentItemCount; i++) {
        initialCandidateIndicesList.push(i);
    }

    exploreCombinations("", initialCandidateIndicesList, 0, 0);

    console.log(formatResultSequence(optimalSequenceString, itemDataRecords));
}
