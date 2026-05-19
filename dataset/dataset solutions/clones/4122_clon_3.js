((rawData) => {
    const inputLines = rawData.split("\n");
    const stationCount = parseInt(inputLines[0], 10);

    const travelTimes = [];
    const startTimes = [];
    const frequencies = [];

    for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
        const currentLineData = inputLines[lineIndex].split(" ").map(val => parseInt(val, 10));
        travelTimes.push(currentLineData[0]);
        startTimes.push(currentLineData[1]);
        frequencies.push(currentLineData[2]);
    }

    const calculateTravelTime = initialStationIdx => {
        if (initialStationIdx === stationCount - 1) {
            return 0;
        }

        let currentStationIndex = initialStationIdx;
        let totalTimeElapsed = 0;

        while (currentStationIndex < stationCount - 1) {
            const currentTravelDuration = travelTimes[currentStationIndex];
            const currentDepartureTime = startTimes[currentStationIndex];
            const currentFrequency = frequencies[currentStationIndex];

            const timeUntilScheduledStart = currentDepartureTime - totalTimeElapsed;
            const waitIfEarly = Math.max(0, timeUntilScheduledStart);

            const remainderAtCurrentTime = totalTimeElapsed % currentFrequency;
            const waitIfMisaligned = (remainderAtCurrentTime !== 0) ? (currentFrequency - remainderAtCurrentTime) : 0;

            const actualWaitDuration = Math.max(waitIfEarly, waitIfMisaligned);

            totalTimeElapsed += actualWaitDuration + currentTravelDuration;
            currentStationIndex++;
        }
        return totalTimeElapsed;
    };

    for (let stationIdx = 0; stationIdx < stationCount; stationIdx++) {
        const resultTime = calculateTravelTime(stationIdx);
        console.log(resultTime);
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));
