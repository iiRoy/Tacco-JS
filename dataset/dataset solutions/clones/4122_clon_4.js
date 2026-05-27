((inputContent) => {
    const rawLines = inputContent.split("\n");
    const stationCount = parseInt(rawLines[0], 10);

    const travelTimes = [];
    const startTimes = [];
    const frequencies = [];

    for (let k = 1; k < rawLines.length; k++) {
        const parts = rawLines[k].split(" ").map(val => parseInt(val, 10));
        if (parts.length === 3) {
            travelTimes.push(parts[0]);
            startTimes.push(parts[1]);
            frequencies.push(parts[2]);
        }
    }

    const calculateJourneyTime = initialStationIndex => {
        if (initialStationIndex === stationCount - 1) {
            return 0;
        }

        const journeyPathIndices = Array.from({ length: stationCount - 1 - initialStationIndex }, (_, idx) => initialStationIndex + idx);

        const finalArrivalTime = journeyPathIndices.reduce((currentTimeAccumulator, currentStationIdx) => {
            const actualArrivalAtStation = Math.max(currentTimeAccumulator, startTimes[currentStationIdx]);
            const departureFromStation = Math.ceil(actualArrivalAtStation / frequencies[currentStationIdx]) * frequencies[currentStationIdx];
            const arrivalAtNextStation = departureFromStation + travelTimes[currentStationIdx];
            return arrivalAtNextStation;
        }, 0);

        return finalArrivalTime;
    };

    const allJourneyTimes = [...Array(stationCount).keys()]
        .map(idx => calculateJourneyTime(idx));

    console.log(allJourneyTimes.join('\n'));

})(require("fs").readFileSync("/dev/stdin", "utf8"));
