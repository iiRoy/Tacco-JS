const SECONDS_PER_FULL_DAY = 86400;

function parseTime(timeString) {
    const components = timeString.split(':');
    const h = parseInt(components[0], 10);
    const m = parseInt(components[1], 10);
    const s = parseInt(components[2], 10);
    return h * 3600 + m * 60 + s;
}

function processAllIntervals() {
    while (true) {
        const eventsCountLine = readline();
        const numEvents = parseInt(eventsCountLine, 10);

        if (numEvents === 0) {
            break;
        }

        const timelineMarkers = [];

        for (let idx = 0; idx < numEvents; ++idx) {
            const timeIntervalString = readline();
            const [startMomentString, endMomentString] = timeIntervalString.split(' ');

            const startMomentSeconds = parseTime(startMomentString);
            const endMomentSeconds = parseTime(endMomentString);

            timelineMarkers.push({ timePoint: startMomentSeconds, typeOfChange: 1 });
            timelineMarkers.push({ timePoint: endMomentSeconds, typeOfChange: -1 });
        }

        timelineMarkers.sort((eventA, eventB) => {
            if (eventA.timePoint !== eventB.timePoint) {
                return eventA.timePoint - eventB.timePoint;
            }
            return eventA.typeOfChange - eventB.typeOfChange;
        });

        let currentSimultaneousEvents = 0;
        let maximumSimultaneousEvents = 0;

        for (const marker of timelineMarkers) {
            currentSimultaneousEvents += marker.typeOfChange;
            if (currentSimultaneousEvents > maximumSimultaneousEvents) {
                maximumSimultaneousEvents = currentSimultaneousEvents;
            }
        }
        console.log(maximumSimultaneousEvents);
    }
}

processAllIntervals();