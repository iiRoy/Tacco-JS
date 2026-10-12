function processInput(rawInput) {
    const lines = rawInput.split("\n");
    const upperLimit = parseInt(lines[0], 10);
    const charSource = lines[1];

    const resultContainer = { total: 0 };

    function exploreCombinations(currentIndices, startFrom, targetSize, maxVal, sourceString, accumulator) {
        if (currentIndices.length === targetSize) {
            const firstIdx = currentIndices[0];
            const secondIdx = currentIndices[1];
            const thirdIdx = currentIndices[2];

            const firstDiff = secondIdx - firstIdx;
            const secondDiff = thirdIdx - secondIdx;

            if (firstDiff !== secondDiff) {
                const charOne = sourceString[firstIdx - 1];
                const charTwo = sourceString[secondIdx - 1];
                const charThree = sourceString[thirdIdx - 1];

                const distinctChars = new Set([charOne, charTwo, charThree]);
                if (distinctChars.size === 3) {
                    accumulator.total++;
                }
            }
            return;
        }

        for (let currentCandidate = startFrom; currentCandidate <= maxVal; currentCandidate++) {
            currentIndices.push(currentCandidate);
            exploreCombinations(currentIndices, currentCandidate + 1, targetSize, maxVal, sourceString, accumulator);
            currentIndices.pop();
        }
    }

    exploreCombinations([], 1, 3, upperLimit, charSource, resultContainer);

    console.log(resultContainer.total);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
