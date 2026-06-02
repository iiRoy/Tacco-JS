function processInputData(rawData) {
    rawData = rawData.split("\n");
    if (rawData[rawData.length - 1] === '') {
        rawData.pop();
    }
    const elementCount = parseInt(rawData[0].split(' ')[0], 10);
    const numericSequence = rawData[1].split(' ').map(val => parseInt(val, 10));
    return { elementCount, numericSequence };
}

function Main(inputString) {
    const { elementCount: totalElements, numericSequence: dataValues } = processInputData(inputString);

    const maxRightIndices = Array.from({ length: totalElements }).reduce((accState, _, currentLeftIndex) => {
        let { rightmostExtent, activeBitUnion, resultsList } = accState;

        // If the previous window's rightmost extent is now to the left of the current left index,
        // we must advance the window's start.
        if (rightmostExtent < currentLeftIndex) {
            rightmostExtent = currentLeftIndex;
            activeBitUnion = 0; // Reset bit union for a new window starting here
        }

        // Remove the element that is now outside the window from the left, if applicable.
        // This is the equivalent of `temp = temp ^ A[i-1]` in the original.
        if (currentLeftIndex > 0) {
            activeBitUnion ^= dataValues[currentLeftIndex - 1];
        }

        // Extend the window to the right as much as possible.
        // The condition (a ^ b) === (a + b) is equivalent to (a & b) === 0.
        while (rightmostExtent < totalElements && (activeBitUnion & dataValues[rightmostExtent]) === 0) {
            activeBitUnion ^= dataValues[rightmostExtent]; // Add to XOR sum
            rightmostExtent++;
        }

        resultsList.push(rightmostExtent - 1); // Store the maximum valid right index for the current left index

        return { rightmostExtent, activeBitUnion, resultsList };
    }, { rightmostExtent: 0, activeBitUnion: 0, resultsList: [] });

    // Calculate the final sum based on the collected maximum right indices.
    const finalResult = maxRightIndices.resultsList.reduce((cumulativeSum, rightBoundary, leftBoundary) => {
        return cumulativeSum + (rightBoundary - leftBoundary + 1);
    }, 0);

    console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
