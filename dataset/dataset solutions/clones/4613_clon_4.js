function processSchedule(sourceInput) {
    const cleansedData = sourceInput.trim();
    const dataRows = cleansedData.split('\n');

    const mainParameters = dataRows[0].split(' ').map(Number);
    const eventCount = mainParameters[0];
    const baseDuration = mainParameters[1];

    const eventTimings = dataRows[1].split(' ').map(Number);
    eventTimings.sort((val1, val2) => val1 - val2);

    if (eventCount === 0) {
        return "0";
    }

    const initialCalculation = {
        totalActiveTime: baseDuration,
        currentEndBoundary: eventTimings[0] + baseDuration
    };

    const finalResult = eventTimings.slice(1).reduce((accumulatorObject, currentEventTime) => {
        const previousEndBoundary = accumulatorObject.currentEndBoundary;
        const potentialNewEnd = currentEventTime + baseDuration;

        if (currentEventTime < previousEndBoundary) {
            const addedSegment = potentialNewEnd - previousEndBoundary;
            if (addedSegment > 0) {
                accumulatorObject.totalActiveTime += addedSegment;
            }
            accumulatorObject.currentEndBoundary = Math.max(previousEndBoundary, potentialNewEnd);
        } else {
            accumulatorObject.totalActiveTime += baseDuration;
            accumulatorObject.currentEndBoundary = potentialNewEnd;
        }
        return accumulatorObject;
    }, initialCalculation);

    return `${finalResult.totalActiveTime}`;
}

console.log(processSchedule(require('node:fs').readFileSync('/dev/stdin', 'utf8')));