const inputProcessor = (() => {
    let internalTokens = [];
    let tokenReadIndex = 0;
    let accumulatedInput = '';

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
        accumulatedInput += chunk;
    });

    const completionPromise = new Promise(resolve => {
        process.stdin.on('end', () => {
            internalTokens = accumulatedInput.split(/\s+/).filter(Boolean);
            resolve();
        });
    });

    const retrieveNextNumericalValue = () => +internalTokens[tokenReadIndex++];
    const retrieveNextTextToken = () => internalTokens[tokenReadIndex++];

    return {
        waitForInputReady: () => completionPromise,
        getNumericalInput: retrieveNextNumericalValue,
        getTextInput: retrieveNextTextToken,
        outputFinalResult: (val) => console.log(val)
    };
})();

const executeGraphAnalysis = async () => {
    await inputProcessor.waitForInputReady();

    const totalNodes = inputProcessor.getNumericalInput();
    const totalConstraints = inputProcessor.getNumericalInput();

    const fixedEdges = []; // Corresponds to 'e' in original
    const selectableEdgePairs = []; // Corresponds to 'f' in original

    // Process each constraint to generate graph edges
    Array.from({ length: totalConstraints }).forEach(() => {
        const currentConstraintString = inputProcessor.getTextInput();
        const parseRegex = /^(\d+)(<=|>=|\*)(\d+)([+-]?)(\d+)$/;
        const regexMatch = currentConstraintString.match(parseRegex);

        if (!regexMatch) { 
            // Should not happen with valid input as per problem constraints
            return; 
        }

        const originNode = +regexMatch[1] - 1; // Convert to 0-indexed
        const destinationNode = +regexMatch[3] - 1; // Convert to 0-indexed
        const operatorSymbol = regexMatch[2];
        const signIndicator = regexMatch[4]; // Can be '', '+', '-'
        const valueMagnitude = +regexMatch[5];

        // Categorize constraint type based on operator and sign
        let operationCategory;
        if (operatorSymbol === '<=') operationCategory = 'LESS_EQUAL';
        else if (operatorSymbol === '>=') operationCategory = 'GREATER_EQUAL';
        else operationCategory = 'MULTIPLY'; // For '*'

        const polarityCategory = (signIndicator === '+') ? 'POSITIVE_SIGN' : 'NEGATIVE_OR_NO_SIGN';

        // Lookup table for generating edges based on constraint type
        const edgeGenerationStrategies = {
            'LESS_EQUAL_POSITIVE_SIGN': (s, d, w) => [{ from: d, to: s, weight: -w }], // d[s] <= d[d] - w <=> s + w <= d
            'LESS_EQUAL_NEGATIVE_OR_NO_SIGN': (s, d, w) => [{ from: d, to: s, weight: 0 }, { from: s, to: d, weight: w }], // d[s] <= d[d] + 0 AND d[d] <= d[s] + w <=> s <= d AND d <= s + w
            'GREATER_EQUAL_POSITIVE_SIGN': (s, d, w) => [{ from: s, to: d, weight: -w }], // d[d] <= d[s] - w <=> d + w <= s
            'GREATER_EQUAL_NEGATIVE_OR_NO_SIGN': (s, d, w) => [{ from: d, to: s, weight: w }, { from: s, to: d, weight: 0 }], // d[s] <= d[d] + w AND d[d] <= d[s] + 0 <=> s <= d + w AND d <= s
            'MULTIPLY_POSITIVE_SIGN': (s, d, w) => [ // Two choices for f: |s - d| = w
                { from: s, to: d, weight: -w }, // d[d] <= d[s] - w <=> d + w <= s
                { from: d, to: s, weight: -w }  // d[s] <= d[d] - w <=> s + w <= d
            ],
            'MULTIPLY_NEGATIVE_OR_NO_SIGN': (s, d, w) => [{ from: d, to: s, weight: w }, { from: s, to: d, weight: w }] // d[s] <= d[d] + w AND d[d] <= d[s] + w <=> |s - d| <= w
        };

        const generatedSegments = edgeGenerationStrategies[`${operationCategory}_${polarityCategory}`](originNode, destinationNode, valueMagnitude);

        if (operationCategory === 'MULTIPLY' && polarityCategory === 'POSITIVE_SIGN') {
            // These are the conditional edges
            selectableEdgePairs.push(generatedSegments);
        } else {
            // These are fixed edges
            fixedEdges.push(...generatedSegments);
        }
    });

    let maximalShortestPath = -Infinity;

    // Recursive function to explore all combinations of selectable edges
    const explorePathCombinations = (currentIndex, currentCombinationEdges) => {
        if (currentIndex === selectableEdgePairs.length) {
            // All choices made for selectable edges, now run Bellman-Ford
            const completeEdgeSet = [...fixedEdges, ...currentCombinationEdges];

            const nodeDistances = new Array(totalNodes).fill(Infinity);
            nodeDistances[0] = 0; // Start node's distance is 0

            // Bellman-Ford algorithm: N iterations of relaxation
            Array.from({ length: totalNodes }).forEach(() => {
                Array.from({ length: completeEdgeSet.length }).forEach((_, edgeIndex) => {
                    const { from, to, weight } = completeEdgeSet[edgeIndex];
                    if (nodeDistances[from] !== Infinity) {
                        nodeDistances[to] = Math.min(nodeDistances[to], nodeDistances[from] + weight);
                    }
                });
            });

            // Check for conditions that lead to a valid path (original code's d[0] >= 0 logic)
            if (nodeDistances[0] >= 0) {
                maximalShortestPath = Math.max(maximalShortestPath, nodeDistances[totalNodes - 1]);
            }
            return;
        }

        // Recursively explore choosing the first edge from the current pair
        explorePathCombinations(currentIndex + 1, [...currentCombinationEdges, selectableEdgePairs[currentIndex][0]]);
        // Recursively explore choosing the second edge from the current pair
        explorePathCombinations(currentIndex + 1, [...currentCombinationEdges, selectableEdgePairs[currentIndex][1]]);
    };

    explorePathCombinations(0, []); // Start the recursive exploration from the first selectable edge pair

    // Output the final result based on `maximalShortestPath`
    if (maximalShortestPath === Infinity) {
        inputProcessor.outputFinalResult('inf');
    } else if (maximalShortestPath === -Infinity) {
        inputProcessor.outputFinalResult(-1);
    } else {
        inputProcessor.outputFinalResult(maximalShortestPath);
    }
};

executeGraphAnalysis();