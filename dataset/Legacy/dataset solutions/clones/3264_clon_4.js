function ProcessData(rawData) {
    const dataLines = rawData.split("\n");
    const [totalItems, selectionCount] = dataLines[0].split(" ").map(Number);

    const allSushiItems = [];
    for (let itemIndex = 1; itemIndex <= totalItems; itemIndex++) {
        const itemDetails = dataLines[itemIndex].split(" ").map(Number);
        allSushiItems.push({ kind: itemDetails[0], savor: itemDetails[1] });
    }

    let overallMaximumScore = 0;

    // Generator function to yield combinations of 'k' elements from an array
    function* generateCombinations(sourceArray, count) {
        const arrayLength = sourceArray.length;
        if (count < 0 || count > arrayLength) return;
        if (count === 0) {
            yield [];
            return;
        }
        if (count === arrayLength) {
            yield sourceArray;
            return;
        }

        // Initialize with the first combination (indices 0 to count-1)
        const currentIndices = Array.from({ length: count }, (_, i) => i);

        while (true) {
            // Yield the current combination of elements
            yield currentIndices.map(idx => sourceArray[idx]);

            // Find the rightmost index that can be incremented
            let i = count - 1;
            while (i >= 0 && currentIndices[i] === arrayLength - count + i) {
                i--;
            }

            // If no such index is found, all combinations have been generated
            if (i < 0) break;

            // Increment the found index
            currentIndices[i]++;

            // Reset subsequent indices to be consecutive
            for (let j = i + 1; j < count; j++) {
                currentIndices[j] = currentIndices[j - 1] + 1;
            }
        }
    }

    // Iterate through all generated combinations
    for (const chosenSet of generateCombinations(allSushiItems, selectionCount)) {
        const distinctKinds = new Set();
        const totalSavor = chosenSet.reduce((accumulator, item) => {
            distinctKinds.add(item.kind);
            return accumulator + item.savor;
        }, 0);

        const kindVarietyScore = distinctKinds.size * distinctKinds.size;
        const currentCalculatedScore = kindVarietyScore + totalSavor;

        if (currentCalculatedScore > overallMaximumScore) {
            overallMaximumScore = currentCalculatedScore;
        }
    }

    console.log(overallMaximumScore);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
