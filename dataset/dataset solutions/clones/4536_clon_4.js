function processInputData(rawInputText) {
    const textLines = rawInputText.split("\n");
    const characterCount = parseInt(textLines[0], 10);
    const characterSequence = textLines[1].split("");

    // Stage 1: Group consecutive identical characters into segments
    // Example: "(()))" -> [{kind: '(', amount: 2}, {kind: ')', amount: 3}]
    const createCharacterSegments = (chars) => {
        if (chars.length === 0) return [];
        return chars.reduce((segments, char) => {
            const lastSeg = segments[segments.length - 1];
            if (lastSeg && lastSeg.kind === char) {
                lastSeg.amount++;
            } else {
                segments.push({ kind: char, amount: 1 });
            }
            return segments;
        }, []);
    };
    const initialCharacterSegments = createCharacterSegments(characterSequence);

    // Stage 2: Convert segments into an alternating count array (similar to original 'temp')
    // This array implicitly stores counts for '(', ')', '(', ')' at indices 0, 1, 2, 3...
    // Zeros are inserted for missing alternating types or for initial/trailing implicit blocks.
    // Example: [{kind: '(', amount: 2}, {kind: ')', amount: 3}] -> [2, 3, 0, 0, 0, 0] (padded)
    // Example: [{kind: ')', amount: 2}, {kind: '(', amount: 3}] -> [0, 2, 3, 0, 0, 0] (padded)
    const generateAlternatingCounts = (segments, totalLen) => {
        const countsVector = [];
        let anticipatedKind = '(';

        if (segments.length > 0 && segments[0].kind === ')') {
            countsVector.push(0); // Prepend 0 for an initial empty '(' block
            anticipatedKind = ')';
        }

        for (const segment of segments) {
            while (segment.kind !== anticipatedKind) {
                countsVector.push(0); // Insert 0 for a missing alternating block
                anticipatedKind = (anticipatedKind === '(') ? ')' : '(';
            }
            countsVector.push(segment.amount);
            anticipatedKind = (anticipatedKind === '(') ? ')' : '(';
        }

        // Pad with zeros to ensure sufficient length for later index access (characterCount + 1)
        while (countsVector.length <= totalLen) {
            countsVector.push(0);
        }
        return countsVector;
    };
    let currentAlternatingCounts = generateAlternatingCounts(initialCharacterSegments, characterCount);

    // Stage 3: Calculate the overall balance of parentheses
    // Sum of even-indexed counts (for '(') minus sum of odd-indexed counts (for ')')
    const calculateNetBalance = (countsArray) => {
        return countsArray.reduce((currentNet, count, idx) => {
            return (idx % 2 === 0) ? currentNet + count : currentNet - count;
        }, 0);
    };
    let netBalance = calculateNetBalance(currentAlternatingCounts);

    // Helper function to find the rightmost non-zero count, searching from a maximum index downwards
    const locateLastActiveSegment = (counts, maxSearchIdx) => {
        let searchIndex = maxSearchIdx;
        while (searchIndex >= 0 && counts[searchIndex] === 0) {
            searchIndex--;
        }
        return searchIndex;
    };

    // Stage 4: Apply balancing transformations based on the net balance
    const applyTransformation = (initialBlocks, currentNetBalance, seqLen) => {
        let transformedBlocks = [...initialBlocks];

        if (currentNetBalance < 0) {
            // Case: More ')' overall. Add absolute difference to the first '(' block.
            const adjustmentValue = -currentNetBalance;
            transformedBlocks = transformedBlocks.map((val, idx) => (idx === 0) ? val + adjustmentValue : val);
        } else if (currentNetBalance > 0) {
            // Case: More '(' overall.
            let effectiveNetBalance = currentNetBalance;

            // Adjust first pair if the initial '(' block is smaller than the initial ')' block
            if (transformedBlocks[0] < transformedBlocks[1]) {
                const initialPairDeficit = transformedBlocks[1] - transformedBlocks[0];
                effectiveNetBalance += initialPairDeficit;
                transformedBlocks[0] = transformedBlocks[1];
            }

            const lastMeaningfulIndex = locateLastActiveSegment(transformedBlocks, seqLen);

            if (lastMeaningfulIndex >= 0) {
                if (lastMeaningfulIndex % 2 === 0) { // If the last active block is '('
                    // Add ')' to the subsequent ')' block
                    transformedBlocks = transformedBlocks.map((val, idx) => (idx === lastMeaningfulIndex + 1) ? val + effectiveNetBalance : val);
                } else { // If the last active block is ')'
                    // Add ')' to this ')' block
                    transformedBlocks = transformedBlocks.map((val, idx) => (idx === lastMeaningfulIndex) ? val + effectiveNetBalance : val);
                }
            }
        } else { // currentNetBalance === 0 (Overall balanced)
            // Adjust first pair if the initial '(' block is smaller than the initial ')' block
            if (transformedBlocks[0] < transformedBlocks[1]) {
                const initialPairDeficit = transformedBlocks[1] - transformedBlocks[0];
                transformedBlocks[0] = transformedBlocks[1];

                const lastMeaningfulIndex = locateLastActiveSegment(transformedBlocks, seqLen);

                if (lastMeaningfulIndex >= 0) {
                    if (lastMeaningfulIndex % 2 === 0) { // If the last active block is '('
                        // Make the subsequent ')' block equal to this '(' block
                        transformedBlocks = transformedBlocks.map((val, idx) => (idx === lastMeaningfulIndex + 1) ? transformedBlocks[lastMeaningfulIndex] : val);
                    } else { // If the last active block is ')'
                        // Add the initialPairDeficit to this ')' block
                        transformedBlocks = transformedBlocks.map((val, idx) => (idx === lastMeaningfulIndex) ? val + initialPairDeficit : val);
                    }
                }
            }
        }
        return transformedBlocks;
    };
    const finalCountsAfterTransformation = applyTransformation(currentAlternatingCounts, netBalance, characterCount);

    // Stage 5: Render the final balanced string from the transformed counts
    const generateFinalString = (finalBlocks) => {
        // Trim trailing zeros from the array for accurate string generation
        let effectiveBlocks = [...finalBlocks];
        let lastNonZeroIdx = effectiveBlocks.length - 1;
        while (lastNonZeroIdx >= 0 && effectiveBlocks[lastNonZeroIdx] === 0) {
            lastNonZeroIdx--;
        }
        effectiveBlocks = effectiveBlocks.slice(0, lastNonZeroIdx + 1);

        return effectiveBlocks.reduce((outputString, count, idx) => {
            if (count > 0) {
                const symbol = (idx % 2 === 0) ? '(' : ')';
                return outputString + symbol.repeat(count);
            }
            return outputString;
        }, "");
    };
    const finalOutput = generateFinalString(finalCountsAfterTransformation);

    console.log(finalOutput);
}

// Entry point for execution
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));