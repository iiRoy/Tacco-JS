"use strict";

const parseStationLineData = (lineContent) => {
    const numericParts = lineContent.split(" ").map(Number);
    return {
        connectionTime: numericParts[0],
        initialDepartureTime: numericParts[1],
        departureFrequency: numericParts[2]
    };
};

const determineNextArrivalTime = (currentArrivalAtStation, stationInitialDeparture, stationFrequency, stationTravelTime) => {
    let effectiveDepartureTime;

    if (currentArrivalAtStation === stationInitialDeparture) {
        effectiveDepartureTime = stationInitialDeparture;
    } else {
        effectiveDepartureTime = Math.max(currentArrivalAtStation, stationInitialDeparture + stationFrequency);
    }
    
    return effectiveDepartureTime + stationTravelTime;
};

const processJourneyData = (inputDataString) => {
    const dataLines = inputDataString.trim().split("\n");
    const totalStations = Number(dataLines[0]);

    const travelDurations = new Array(totalStations - 1);
    const initialDepartures = new Array(totalStations - 1);
    const trainFrequencies = new Array(totalStations - 1);

    for (let lineIdx = 1; lineIdx < totalStations; lineIdx++) {
        const stationDetails = parseStationLineData(dataLines[lineIdx]);
        const arrayIndex = lineIdx - 1;
        travelDurations[arrayIndex] = stationDetails.connectionTime;
        initialDepartures[arrayIndex] = stationDetails.initialDepartureTime;
        trainFrequencies[arrayIndex] = stationDetails.departureFrequency;
    }

    const finalArrivalTimes = [];

    for (let startStationIdx = 0; startStationIdx < totalStations; startStationIdx++) {
        if (startStationIdx === totalStations - 1) {
            finalArrivalTimes.push(0);
            continue;
        }

        let currentJourneyTime = 0;

        currentJourneyTime = initialDepartures[startStationIdx] + travelDurations[startStationIdx];

        for (let nextLegStationIdx = startStationIdx + 1; nextLegStationIdx < totalStations - 1; nextLegStationIdx++) {
            const stationDepartureTime = initialDepartures[nextLegStationIdx];
            const stationFrequency = trainFrequencies[nextLegStationIdx];
            const stationTravelDuration = travelDurations[nextLegStationIdx];

            currentJourneyTime = determineNextArrivalTime(
                currentJourneyTime,
                stationDepartureTime,
                stationFrequency,
                stationTravelDuration
            );
        }

        finalArrivalTimes.push(currentJourneyTime);
    }

    console.log(finalArrivalTimes.join("\n"));
};

processJourneyData(require('fs').readFileSync('/dev/stdin', 'utf8'));
