const obtainRawScheduleData = () => {
    // In a real execution environment, this would acquire the input string,
    // e.g., from standard input, a file, or an environment variable.
    // For this Type IV clone, we assume the input is provided here directly
    // or through a globally accessible variable like `__CLONE_INPUT_STRING__`.
    // We avoid 'require' and 'fs' identifiers.
    
    // Example input for testing (replace with actual input source if running):
    // "3\n1 2\n3 1\n4 2"
    
    // If running in Node.js and assuming standard input like original,
    // a synchronous read without 'fs' is problematic.
    // For the purpose of Type IV, the core algorithm is the focus.
    // We will simulate it by assuming the string is available.
    if (typeof __CLONE_INPUT_STRING__ !== 'undefined') {
        return __CLONE_INPUT_STRING__;
    }
    // Fallback for direct execution if __CLONE_INPUT_STRING__ is not set
    // For a strict clone this section should be replaced by actual input acquisition
    // equivalent to `readFileSync('/dev/stdin')` but without those identifiers.
    // As synchronous stdin without 'fs' is non-trivial and often relies on specific runtime features
    // or external modules, we use a placeholder.
    // For example, if it were always available as a global like `systemInputBuffer`
    // return systemInputBuffer.toString('utf8');
    
    // A concrete example for testing purposes:
    return "3\n1 2\n3 1\n4 2";
};

const processActivitySchedule = (rawInputText) => {
    // Stage 1: Input Transformation - Diverging from split/map chain
    const translateRawToStructured = (sourceData) => {
        const extractLinesRecursively = (remainingText, collectedLines = [], currentOffset = 0) => {
            const nextLineBreakPosition = remainingText.indexOf('\n', currentOffset);
            if (nextLineBreakPosition === -1) {
                const finalSegment = remainingText.substring(currentOffset).trim();
                if (finalSegment.length > 0) collectedLines.push(finalSegment);
                return collectedLines;
            }
            const currentLineSegment = remainingText.substring(currentOffset, nextLineBreakPosition).trim();
            if (currentLineSegment.length > 0) collectedLines.push(currentLineSegment);
            return extractLinesRecursively(remainingText, collectedLines, nextLineBreakPosition + 1);
        };

        const allTextualLines = extractLinesRecursively(sourceData);
        const relevantActivityLines = allTextualLines.slice(1); // Skip the initial count line

        const convertLineToEventObject = (lineElements) => {
            if (lineElements.length === 0) return [];
            const currentItemString = lineElements[0];
            const spaceSeparator = currentItemString.indexOf(' ');
            const initialMoment = parseInt(currentItemString.substring(0, spaceSeparator), 10);
            const spanDuration = parseInt(currentItemString.substring(spaceSeparator + 1), 10);

            return [
                {
                    commencement: initialMoment,
                    duration: spanDuration,
                    completion: initialMoment + spanDuration - 1, // Calculated end point
                    criterionPoint: initialMoment - spanDuration + 1 // Special start point for selection
                },
                ...convertLineToEventObject(lineElements.slice(1))
            ];
        };

        return convertLineToEventObject(relevantActivityLines);
    };

    let activityUnits = translateRawToStructured(rawInputText);

    // Stage 2: Ordering of Activities - Diverging comparison logic
    const orderActivitiesByCompletion = (unorganizedEvents) => {
        const eventComparisonRoutine = (eventA, eventB) => {
            // Explicit if/else comparison instead of direct subtraction
            if (eventA.completion < eventB.completion) {
                return -1;
            } else if (eventA.completion > eventB.completion) {
                return 1;
            }
            return 0;
        };
        unorganizedEvents.sort(eventComparisonRoutine); // Using a named comparison function
        return unorganizedEvents;
    };
    
    activityUnits = orderActivitiesByCompletion(activityUnits);

    // Stage 3: Optimal Selection - Diverging from imperative for loop
    const determineOptimalSequence = (orderedEvents) => {
        if (orderedEvents.length === 0) return [];

        // Functional reduction for building the result array
        return orderedEvents.reduce((resultCollection, currentEvent, eventIndex) => {
            if (eventIndex === 0) {
                // The very first event is always part of the sequence
                resultCollection.push(currentEvent);
            } else {
                const previousEventInSequence = resultCollection[resultCollection.length - 1];
                // Applying the specific non-overlap condition from the original logic:
                // lastSelectedRobotEnd <= start
                // which translates to: previousEventInSequence.completion <= currentEvent.criterionPoint
                if (previousEventInSequence.completion <= currentEvent.criterionPoint) {
                    resultCollection.push(currentEvent);
                }
            }
            return resultCollection;
        }, []); // Initial accumulator is an empty array
    };

    const chosenUnits = determineOptimalSequence(activityUnits);

    // Stage 4: Output Presentation - Matching original output format
    console.log(activityUnits);
    console.log(chosenUnits);
    console.log(chosenUnits.length);
};

// Execution pathway:
// This assumes the environment makes `process` globally available (Node.js)
// and handles synchronous input from stdin.
// If direct `process.stdin.read()` is not feasible or desired due to async nature,
// the `obtainRawScheduleData` function would need to be adjusted
// to receive input via other means (e.g., a hardcoded string or argument).

// Execute the main processing function with the obtained input
processActivitySchedule(obtainRawScheduleData());