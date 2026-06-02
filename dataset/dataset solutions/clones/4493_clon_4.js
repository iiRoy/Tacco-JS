let rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    rawData += chunk;
});

function countPrefixRepetitions(sourceString, pattern) {
    let currentCount = 0;
    let currentPosition = 0;
    const patternLength = pattern.length;

    if (patternLength === 0) {
        return 0;
    }

    while (sourceString.startsWith(pattern, currentPosition)) {
        currentCount++;
        currentPosition += patternLength;
    }
    return currentCount;
}

process.stdin.on('end', () => {
    const processedInput = rawData.split("\n")[0].slice(0, -1);

    // Replicate original behavior for specific input lengths:
    // Original code's `herftext` length calculation and `while(herftext.length != 2)` loop condition
    // leads to different outcomes for short input strings.

    // Case 1: processedInput.length is 0, 1, or 2
    // Original: `herftext` length becomes 0 or 1, causing an infinite loop.
    if (processedInput.length <= 2) {
        // This will cause the process to hang indefinitely,
        // replicating the original's infinite loop for these inputs.
        while (true) {}
    }

    // Case 2: processedInput.length is 3 or 4
    // Original: `herftext` length becomes 2, so the `while` loop is skipped.
    // `ary` and `ary2` remain empty.
    // `Math.max.apply(null, [])` returns `-Infinity`.
    // `ary.indexOf(-Infinity)` returns `-1`.
    // Accessing `ary2[-1]` results in `undefined`.
    // `undefined.length` then throws a `TypeError`.
    if (processedInput.length === 3 || processedInput.length === 4) {
        // Simulate the exact TypeError.
        const emptyCollection = [];
        const maximumValue = Math.max.apply(null, emptyCollection); // maximumValue will be -Infinity
        const targetIndex = emptyCollection.indexOf(maximumValue); // targetIndex will be -1
        const undefinedReference = emptyCollection[targetIndex]; // undefinedReference will be undefined
        // This line will throw TypeError: Cannot read properties of undefined (reading 'length')
        console.log(undefinedReference.length * maximumValue);
        return;
    }

    // Case 3: processedInput.length >= 5
    // Normal execution path, where the original loop runs.
    let maxRepetitions = 0;
    let optimalPatternLength = 0;

    // The original `herftext` starts with a length of `text.length - Math.floor(text.length / 2)`,
    // which is equivalent to `Math.ceil(text.length / 2)`.
    // The original loop `while(herftext.length != 2)` processes patterns from this initial length
    // down to a length of 3 (as when `herftext.length` becomes 2, the loop terminates).
    const initialCandidateLength = Math.ceil(processedInput.length / 2);

    // Iterate downwards from the initial pattern length down to 3,
    // as patterns of length 2 are not processed by the original loop.
    for (let currentLength = initialCandidateLength; currentLength >= 3; currentLength--) {
        const currentPatternCandidate = processedInput.substring(0, currentLength);
        const currentRepetitionCount = countPrefixRepetitions(processedInput, currentPatternCandidate);

        // Update max if a better pattern is found.
        // If counts are equal, the longer pattern (encountered first in this descending loop) is preferred,
        // matching the original `indexOf` behavior.
        if (currentRepetitionCount > maxRepetitions) {
            maxRepetitions = currentRepetitionCount;
            optimalPatternLength = currentLength;
        }
    }

    console.log(maxRepetitions * optimalPatternLength);
});
