const fileSystem = require('fs');

const processInputData = (rawContent) => {
    const lines = rawContent.trim().split('\n');
    const results = [];
    let currentLineIndex = 0;

    const executeNextCase = () => {
        if (currentLineIndex >= lines.length) {
            return;
        }

        const dimensionValues = lines[currentLineIndex++].split(' ').map(Number);
        const elementCount = dimensionValues[0];
        const upperSumBound = dimensionValues[1];

        if (elementCount === 0 && upperSumBound === 0) {
            return;
        }

        const sourceNumbers = Array.from({ length: elementCount }, () => Number(lines[currentLineIndex++]));
        sourceNumbers.push(0);

        const derivedSums = sourceNumbers.flatMap((firstVal, firstIdx) =>
            sourceNumbers.slice(firstIdx).map(secondVal => firstVal + secondVal)
        );

        derivedSums.sort((valA, valB) => valA - valB);

        let highestAchievedSum = 0;
        let lowPtr = 0;
        let highPtr = derivedSums.length - 1;

        while (lowPtr <= highPtr) {
            const candidateSum = derivedSums[lowPtr] + derivedSums[highPtr];

            if (candidateSum <= upperSumBound) {
                highestAchievedSum = Math.max(highestAchievedSum, candidateSum);
                lowPtr++;
            } else {
                highPtr--;
            }
        }
        results.push(highestAchievedSum);
        executeNextCase();
    };

    executeNextCase();
    return results;
};

const fileContents = fileSystem.readFileSync('/dev/stdin', 'utf8');
const outputValues = processInputData(fileContents);
outputValues.forEach(outputItem => console.log(outputItem));
