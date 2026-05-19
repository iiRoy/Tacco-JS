process.stdin.on("data", function(inputChunk) {
    String(inputChunk).trim().split("\n").some(function(inputLine) {
        const lineSegments = inputLine.split(" ");
        const maximumValue = Number(lineSegments[0]);
        const targetTotal = Number(lineSegments[1]);

        if (!maximumValue && !targetTotal) {
            return true;
        }

        let resultCount = 0;

        function findCombinationsRecursive(currentCandidate, selectedCount, currentSum) {
            if (selectedCount === 3) {
                if (currentSum === targetTotal) {
                    resultCount++;
                }
                return;
            }

            const remainingNeeded = 3 - selectedCount;
            if (currentCandidate > maximumValue || (maximumValue - currentCandidate + 1) < remainingNeeded) {
                return;
            }

            const minimumPossibleSumFromHere = currentSum +
                                               (remainingNeeded * currentCandidate) +
                                               (remainingNeeded * (remainingNeeded - 1) / 2);
            if (minimumPossibleSumFromHere > targetTotal) {
                return;
            }

            findCombinationsRecursive(currentCandidate + 1, selectedCount + 1, currentSum + currentCandidate);
            findCombinationsRecursive(currentCandidate + 1, selectedCount, currentSum);
        }

        findCombinationsRecursive(1, 0, 0);
        console.log(resultCount);
    });
}).resume();
