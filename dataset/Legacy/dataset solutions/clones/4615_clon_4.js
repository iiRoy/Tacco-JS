function parseInputData(rawText) {
    const lines = rawText.split('\n');
    const [firstLine, secondLine] = lines;

    const [numEventsStr, durationThresholdStr] = firstLine.split(' ');
    const numEvents = Number(numEventsStr);
    const durationThreshold = Number(durationThresholdStr);

    const eventTimestamps = secondLine.split(' ').map(Number);

    return { numEvents, durationThreshold, eventTimestamps };
}

function deriveTotalActiveTime(inputParameters) {
    const { numEvents, durationThreshold, eventTimestamps } = inputParameters;

    // The original logic initializes 'ans' to 0 and iterates from the second event (i=1).
    // If there are 0 or 1 events, the loop does not execute, and 'ans' remains 0.
    // The final output is 'ans + T'.
    // For 0 or 1 events, this means 0 + durationThreshold.
    // The `reduce` method applied to an empty array (which `eventTimestamps.slice(1)` would be for 0 or 1 events)
    // correctly returns the initial accumulator value (0 in this case).
    const accumulatedValue = eventTimestamps.slice(1).reduce((currentAccum, currentTimestamp, indexInSlicedArray) => {
        // `currentTimestamp` corresponds to `t[i]` in the original loop.
        // `indexInSlicedArray` is 0 for t[1], 1 for t[2], etc.
        // Therefore, `previousTimestamp` corresponds to `t[i-1]`, which is `eventTimestamps[indexInSlicedArray]`.
        const previousTimestamp = eventTimestamps[indexInSlicedArray];
        const timeDelta = currentTimestamp - previousTimestamp;

        if (timeDelta < durationThreshold) {
            return currentTimestamp; // Equivalent to `ans = t[i]` in the original logic
        } else {
            return currentAccum + durationThreshold; // Equivalent to `ans += T` in the original logic
        }
    }, 0); // The initial value for `ans` in the original code is 0.

    return accumulatedValue + durationThreshold; // Equivalent to `console.log(ans + T)` in the original logic
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const processedData = parseInputData(fileContent);
const finalCalculatedResult = deriveTotalActiveTime(processedData);
console.log(finalCalculatedResult);
