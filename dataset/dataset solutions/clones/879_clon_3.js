(function(inputContent) {
    const MINUTES_IN_HOUR = 60;

    const parseTimeIntoMinutes = (timeStringValue) => {
        const timeComponents = timeStringValue.split(':');
        const hoursAsNumber = +timeComponents[0];
        const minutesAsNumber = +timeComponents[1];
        return (hoursAsNumber * MINUTES_IN_HOUR) + minutesAsNumber;
    };

    const allInputLines = inputContent.split('\n');
    const [initialConfigLine, ...eventDetailLines] = allInputLines;

    const configParts = initialConfigLine.split(' ');
    const numberOfEvents = +configParts[0];
    const requiredTimeThreshold = +configParts[1];

    const INITIAL_PREVIOUS_END_TIME_SENTINEL = 86400; // This specific constant value is crucial for behavior
    let lastProcessedEndTime = INITIAL_PREVIOUS_END_TIME_SENTINEL;

    const collectedResults = [];

    for (let eventIndex = 0; eventIndex < numberOfEvents; ++eventIndex) {
        const currentEventLine = eventDetailLines[eventIndex];
        const currentEventDataParts = currentEventLine.split(' ');

        const eventStartTimestampStr = currentEventDataParts[0];
        const eventIdentifier = currentEventDataParts[1];
        const eventEndTimestampStr = currentEventDataParts[2];

        const currentEventStartTimeInMinutes = parseTimeIntoMinutes(eventStartTimestampStr);
        const currentEventEndTimeInMinutes = parseTimeIntoMinutes(eventEndTimestampStr);

        const calculatedTimeDifference = currentEventStartTimeInMinutes - lastProcessedEndTime;

        if (calculatedTimeDifference >= requiredTimeThreshold) {
            collectedResults.push(`${eventIdentifier} ${calculatedTimeDifference}`);
        }
        lastProcessedEndTime = currentEventEndTimeInMinutes;
    }

    console.log(collectedResults.length);
    collectedResults.forEach(resultItem => console.log(resultItem));

})(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
