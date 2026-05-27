function processInputData(rawData) {
    const TO_NUMBER_CONVERTER = Number;

    const parseNumericLine = (lineString) => {
        return lineString.split(" ").map(TO_NUMBER_CONVERTER);
    };

    const rawDataLines = rawData.split("\n");

    const configurationParameters = parseNumericLine(rawDataLines[0]);
    const eventStartPoints = parseNumericLine(rawDataLines[1]);

    let totalAccumulatedDuration = 0;
    let currentActiveIntervalStart = -1;
    let currentActiveIntervalEnd = -1;

    if (eventStartPoints.length === 0) {
        console.log(totalAccumulatedDuration);
        return;
    }

    const durationPerEvent = configurationParameters[1];

    currentActiveIntervalStart = eventStartPoints[0];
    currentActiveIntervalEnd = eventStartPoints[0] + durationPerEvent;

    for (let pointIndex = 1; pointIndex < eventStartPoints.length; pointIndex++) {
        const currentEventStartTime = eventStartPoints[pointIndex];
        const currentEventEndTime = currentEventStartTime + durationPerEvent;

        if (currentActiveIntervalEnd < currentEventStartTime) {
            const completedSegmentDuration = currentActiveIntervalEnd - currentActiveIntervalStart;
            totalAccumulatedDuration += completedSegmentDuration;

            currentActiveIntervalStart = currentEventStartTime;
            currentActiveIntervalEnd = currentEventEndTime;
        } else {
            currentActiveIntervalEnd = currentEventEndTime;
        }
    }

    const finalSegmentDuration = currentActiveIntervalEnd - currentActiveIntervalStart;
    totalAccumulatedDuration += finalSegmentDuration;

    console.log(totalAccumulatedDuration);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
