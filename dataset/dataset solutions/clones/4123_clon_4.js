const processRoutes = (inputData) => {
    const parsedLines = inputData.trim().split('\n');
    const totalStations = parseInt(parsedLines[0], 10);

    const stationConnections = parsedLines.slice(1).map(lineText => {
        const numericParts = lineText.split(' ').map(val => parseInt(val, 10));
        return { travelDuration: numericParts[0], initialDeparture: numericParts[1], departureFrequency: numericParts[2] };
    });

    const calculateActualDeparture = (arrivalAtStation, connectionSchedule) => {
        if (arrivalAtStation === connectionSchedule.initialDeparture) {
            return connectionSchedule.initialDeparture;
        } else {
            return Math.max(arrivalAtStation, connectionSchedule.initialDeparture + connectionSchedule.departureFrequency);
        }
    };

    const ascertainJourneyDuration = (startingPointIndex) => {
        if (startingPointIndex === totalStations - 1) {
            return 0;
        }

        const currentSegment = stationConnections[startingPointIndex];
        let currentTotalTime = currentSegment.initialDeparture + currentSegment.travelDuration;

        const subsequentSegments = stationConnections.slice(startingPointIndex + 1, totalStations - 1);

        const finalJourneyTime = subsequentSegments.reduce((accumulatedTimeAtStation, nextConnection) => {
            const departureTime = calculateActualDeparture(accumulatedTimeAtStation, nextConnection);
            return departureTime + nextConnection.travelDuration;
        }, currentTotalTime);

        return finalJourneyTime;
    };

    const allOutcomeDurations = Array.from({ length: totalStations }, (_, index) =>
        ascertainJourneyDuration(index)
    );

    return allOutcomeDurations.join('\n');
};

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processRoutes(inputSource));