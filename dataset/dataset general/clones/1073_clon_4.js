(function() {

    const pathfindingEngine = (function() {

        const maximumPossibleValue = Number.MAX_SAFE_INTEGER;

        function generateIndexPermutations(inputElements) {
            const allArrangements = [];
            const n = inputElements.length;
            const currentArrangement = [...inputElements];
            const counters = new Array(n).fill(0);
            let currentIdx = 1;
            let swapIdx;

            allArrangements.push([...currentArrangement]);

            while (currentIdx < n) {
                if (counters[currentIdx] < currentIdx) {
                    swapIdx = currentIdx % 2 === 0 ? 0 : counters[currentIdx];
                    [currentArrangement[currentIdx], currentArrangement[swapIdx]] = [currentArrangement[swapIdx], currentArrangement[currentIdx]];
                    allArrangements.push([...currentArrangement]);
                    counters[currentIdx]++;
                    currentIdx = 1;
                } else {
                    counters[currentIdx] = 0;
                    currentIdx++;
                }
            }
            return allArrangements;
        }

        function calculateSequenceCost(sequenceOfNodes, weightMatrix) {
            let accumulatedCost = 0;
            for (let i = 0; i < sequenceOfNodes.length - 1; ++i) {
                const origin = sequenceOfNodes[i];
                const destination = sequenceOfNodes[i + 1];
                accumulatedCost += weightMatrix[origin][destination];
            }
            return accumulatedCost;
        }

        function evaluateAllOptions(connectionWeights, nodeCount, searchMode) {
            let minimumWeight = maximumPossibleValue;
            let optimumSequence = [];

            let intermediateNodeIndices = [];
            const startingNode = 0;
            let endingNode;

            if (searchMode === 0) {
                for (let i = 1; i < nodeCount; ++i) {
                    intermediateNodeIndices.push(i);
                }
                endingNode = 0;
            } else if (searchMode === 1) {
                for (let i = 1; i < nodeCount - 1; ++i) {
                    intermediateNodeIndices.push(i);
                }
                endingNode = nodeCount - 1;
            } else {
                throw new Error("Invalid search mode provided. Use 0 for round trip, 1 for fixed start/end.");
            }

            if (nodeCount === 0) {
                return { optimalPath: [], totalOptimalCost: 0 };
            }
            
            const allPermutations = generateIndexPermutations(intermediateNodeIndices);

            for (const currentPermutation of allPermutations) {
                const completePathCandidate = [startingNode, ...currentPermutation, endingNode];
                const currentSequenceCost = calculateSequenceCost(completePathCandidate, connectionWeights);

                if (currentSequenceCost < minimumWeight) {
                    minimumWeight = currentSequenceCost;
                    optimumSequence = completePathCandidate;
                }
            }

            return { optimalPath: optimumSequence, totalOptimalCost: minimumWeight };
        }

        return {
            computeOptimalPathByBruteForce: evaluateAllOptions
        };

    })();

    return pathfindingEngine;

})();