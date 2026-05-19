(function(rawInput) {
    const initialParsedData = rawInput.split("\n").map(lineSegment => lineSegment.split(" "));

    const processPairsRecursively = (sourceSegments, currentPosition, accumulatedOutput) => {
        const currentSegmentPair = sourceSegments[currentPosition];

        // If currentSegmentPair is undefined, accessing currentSegmentPair[0] will throw
        // TypeError: Cannot read properties of undefined (reading '0'), replicating original behavior.
        const firstStringValue = currentSegmentPair[0];
        const secondStringValue = currentSegmentPair[1];

        const firstNumericValue = Number(firstStringValue);
        const secondNumericValue = Number(secondStringValue);

        if (firstNumericValue === 0 && secondNumericValue === 0) {
            // Termination condition: both values are 0
            return accumulatedOutput;
        } else if (firstNumericValue === 0 && isNaN(secondNumericValue)) {
            // Special case for empty input line resulting in [""]
            // Original code: `"" != 0` is false, `undefined != 0` is true. `false && true` is false.
            // Loop terminates without processing this line or throwing an error.
            return accumulatedOutput;
        } else {
            // Process the current pair and recurse
            const currentOutputLine = `${secondNumericValue} ${firstNumericValue}`;
            const updatedAccumulatedOutput = accumulatedOutput.length > 0 ?
                `${accumulatedOutput}\n${currentOutputLine}` :
                currentOutputLine;
            return processPairsRecursively(sourceSegments, currentPosition + 1, updatedAccumulatedOutput);
        }
    };

    const finalResultString = processPairsRecursively(initialParsedData, 0, "");
    if (finalResultString.length > 0) {
        console.log(finalResultString);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
