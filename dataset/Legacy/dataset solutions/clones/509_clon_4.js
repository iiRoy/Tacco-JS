process.stdin.resume();
process.stdin.setEncoding('utf8');

const processInput = (inputBuffer) => {
    const allLines = inputBuffer.trim().split("\n");
    let currentLineIndex = 0;

    const identifyAnomaly = (sourceData) => {
        const numericValues = sourceData.map(Number);

        if (numericValues.length < 2) {
            return sourceData[0];
        }

        const initialProcessingState = {
            lastKnownValue: numericValues[1],
            lastKnownDifference: numericValues[1] - numericValues[0],
            differenceBreakpoints: [], // Stores indices (equivalent to 'ii' in original) where difference changed
            finalOutputCandidate: null
        };

        const completedState = numericValues.slice(2).reduce((stateAccumulator, currentValue, relativePosition) => {
            if (stateAccumulator.finalOutputCandidate !== null) {
                return stateAccumulator;
            }

            const absoluteIndex = relativePosition + 2; // Corresponds to 'ii' in original loop
            const currentCalculatedDifference = currentValue - stateAccumulator.lastKnownValue;

            if (currentCalculatedDifference !== stateAccumulator.lastKnownDifference) {
                stateAccumulator.differenceBreakpoints.push(absoluteIndex);
            }

            stateAccumulator.lastKnownValue = currentValue;
            stateAccumulator.lastKnownDifference = currentCalculatedDifference;

            const breakpointCount = stateAccumulator.differenceBreakpoints.length;
            const latestBreakpointIndex = breakpointCount > 0 ? stateAccumulator.differenceBreakpoints[breakpointCount - 1] : 0;

            if (breakpointCount === 3) {
                stateAccumulator.finalOutputCandidate = sourceData[latestBreakpointIndex - 2];
            } else if (breakpointCount === 1 && absoluteIndex - latestBreakpointIndex > 1) {
                stateAccumulator.finalOutputCandidate = sourceData[latestBreakpointIndex - 2];
            }

            return stateAccumulator;
        }, initialProcessingState);

        if (completedState.finalOutputCandidate !== null) {
            return completedState.finalOutputCandidate;
        }

        const finalBreakpointCount = completedState.differenceBreakpoints.length;
        const finalBreakpointIndex = finalBreakpointCount > 0 ? completedState.differenceBreakpoints[finalBreakpointCount - 1] : 0;

        return sourceData[finalBreakpointIndex];
    };

    while (currentLineIndex < allLines.length) {
        const itemQuantity = parseInt(allLines[currentLineIndex++]);
        if (itemQuantity === 0) {
            break;
        }

        const dataItems = allLines[currentLineIndex++].trim().split(" ");
        console.log(identifyAnomaly(dataItems));
    }
};

process.stdin.on('data', processInput);
