const retrieveContent = require('fs').readFileSync;

const obtainData = () => {
    const contentLines = retrieveContent('/dev/stdin', 'utf8').trim().split('\n');
    const extentValue = Number(contentLines[0]);
    const characterString = contentLines[1];
    return { extentValue, characterString };
};

const computeLeftwardCounts = (totalLength, sequence) => {
    const countsCollection = [0]; // Represents the count of 'W's in the prefix of length 0.
    sequence.split('').reduce((cumulativeCount, char) => {
        const updatedCount = cumulativeCount + (char === 'W' ? 1 : 0);
        countsCollection.push(updatedCount);
        return updatedCount;
    }, 0);
    // countsCollection[k] now holds the number of 'W's in the first k characters of the sequence.
    return countsCollection;
};

const computeRightwardCounts = (totalLength, sequence) => {
    const countsCollection = new Array(totalLength + 1).fill(0); // countsCollection[totalLength] represents count for empty suffix.
    sequence.split('').reduceRight((cumulativeCount, char, index) => {
        const updatedCount = cumulativeCount + (char === 'E' ? 1 : 0);
        countsCollection[index] = updatedCount;
        return updatedCount;
    }, 0);
    // countsCollection[k] now holds the number of 'E's from index k to the end of the sequence.
    return countsCollection;
};

const evaluateMinima = (dimension, leftCounts, rightCounts) => {
    const potentialOutcomes = Array.from({ length: dimension + 1 }, (_, position) => {
        const currentLeftWest = leftCounts[position];
        // The original logic accesses E[i+1]. For i=N, this would be E[N+1].
        // The original code implies this value should be 0 if out of bounds.
        const currentRightEast = (position + 1 <= dimension) ? rightCounts[position + 1] : 0;
        return currentLeftWest + currentRightEast;
    });
    return Math.min(...potentialOutcomes);
};

const initiateProcessing = () => {
    const { extentValue, characterString } = obtainData();

    const westAccumulations = computeLeftwardCounts(extentValue, characterString);
    const eastAccumulations = computeRightwardCounts(extentValue, characterString);

    const finalOptimalValue = evaluateMinima(extentValue, westAccumulations, eastAccumulations);

    console.log(finalOptimalValue);
};

initiateProcessing();