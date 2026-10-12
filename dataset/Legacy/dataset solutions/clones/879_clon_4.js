const processInputData = (rawData) => {
    const allLines = rawData.split('\n');

    const parseTimeIntoMinutes = (timeStringRepresentation) => {
        const [hourComponent, minuteComponent] = timeStringRepresentation.split(':').map(Number);
        return (hourComponent * 60) + minuteComponent;
    };

    const [configLine, ...dataLines] = allLines;
    const [totalEntriesStr, requiredThresholdStr] = configLine.split(' ');
    const totalEntries = Number(totalEntriesStr);
    const requiredThreshold = Number(requiredThresholdStr);

    const initialProcessingState = {
        accumulatedResults: [],
        lastRecordedEndTime: 86400
    };

    const finalProcessingState = dataLines.slice(0, totalEntries).reduce((currentState, currentEntryLine) => {
        const [startMomentStr, identifierValue, endMomentStr] = currentEntryLine.split(' ');
        const currentStartMinutes = parseTimeIntoMinutes(startMomentStr);
        const currentEndMinutes = parseTimeIntoMinutes(endMomentStr);

        const elapsedDuration = currentStartMinutes - currentState.lastRecordedEndTime;

        if (elapsedDuration >= requiredThreshold) {
            currentState.accumulatedResults.push(`${identifierValue} ${elapsedDuration}`);
        }

        currentState.lastRecordedEndTime = currentEndMinutes;
        return currentState;
    }, initialProcessingState);

    return finalProcessingState.accumulatedResults;
};

const processedOutput = processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

console.log(processedOutput.length);
processedOutput.forEach(resultItem => console.log(resultItem));
