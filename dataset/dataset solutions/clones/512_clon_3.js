process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputBuffer) {
    // Helper function to safely parse integers with radix 10
    const parseNumericValue = (str) => parseInt(str, 10);

    // Helper function to calculate the difference between two elements from a given array
    const calculateElementDifference = (arr, indexA, indexB) => {
        return parseNumericValue(arr[indexA]) - parseNumericValue(arr[indexB]);
    };

    const inputLines = inputBuffer.trim().split("\n");
    let currentLineIndex = 0; // Renamed 'i' to 'currentLineIndex' for clarity

    while (currentLineIndex < inputLines.length) {
        // Read the number of elements for the current dataset
        const elementCount = parseNumericValue(inputLines[currentLineIndex++]); // Renamed 'n' to 'elementCount'
        if (elementCount === 0) {
            break; // Terminate processing if elementCount is zero
        }

        // Determine the required length for the differences array
        const diffsArrayLength = elementCount + 1; // Renamed 'end' to 'diffsArrayLength'
        // Initialize an array to store the differences between consecutive elements
        const diffs = new Array(diffsArrayLength); // Renamed 'map' to 'diffs'

        // Read the actual data values for the current dataset
        const dataValues = inputLines[currentLineIndex++].trim().split(" "); // Renamed 'dataset' to 'dataValues'

        // Populate the differences array: diffs[k] = dataValues[k] - dataValues[k-1]
        for (let diffIndex = 1; diffIndex < diffsArrayLength; ++diffIndex) { // Renamed 'ii' to 'diffIndex'
            diffs[diffIndex] = calculateElementDifference(dataValues, diffIndex, diffIndex - 1);
        }

        // Introduce temporary boolean variables to simplify complex conditional checks
        const areFirstFourDiffsConsistent = (diffs[1] === diffs[2] && diffs[2] === diffs[3] && diffs[3] === diffs[4]);
        const areLastThreeDiffsConsistent = (diffs[2] === diffs[3] && diffs[3] === diffs[4]);
        const areFirstThreeDiffsConsistent = (diffs[1] === diffs[2] && diffs[2] === diffs[3]);

        let outputElementPosition; // Variable to store the index of the element to be logged
        let loopIterationIndex; // Equivalent to 'ii' in the original's second loop, declared for wider scope

        if (areFirstFourDiffsConsistent) {
            loopIterationIndex = 5; // Start checking from the fifth difference
            // Iterate to find the first difference that breaks the pattern
            while (loopIterationIndex < diffsArrayLength) {
                if (diffs[loopIterationIndex] !== diffs[1]) {
                    break; // Found a differing element
                }
                loopIterationIndex++;
            }
            outputElementPosition = loopIterationIndex; // The index of the element to output
        } else if (areLastThreeDiffsConsistent) {
            outputElementPosition = 0;
        } else if (areFirstThreeDiffsConsistent) {
            outputElementPosition = 4;
        } else if (calculateElementDifference(dataValues, 2, 0) === diffs[3] && areLastThreeDiffsConsistent) {
            outputElementPosition = 1;
        } else if (diffs[1] === diffs[2] && diffs[2] === calculateElementDifference(dataValues, 4, 2)) {
            outputElementPosition = 3;
        } else if (diffs[1] === calculateElementDifference(dataValues, 3, 1) && diffs[1] === diffs[4]) {
            outputElementPosition = 2;
        }

        // Log the identified element from the dataValues array
        console.log(dataValues[outputElementPosition]);
    }
});
