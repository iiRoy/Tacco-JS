const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((inputString) => {
    const parseInteger = (strValue) => parseInt(strValue, 10);

    const getSign = (numericValue) => {
        if (numericValue > 0) return 1;
        if (numericValue < 0) return -1;
        return 0;
    };

    const dataLines = inputString.split('\n');

    const arrayLength = parseInteger(dataLines[0]);

    const numericArray = dataLines[1].split(' ').map(item => Number(item));

    let turnCount = 0;
    let currentTrend = 0; // 0: initial/flat, 1: increasing, -1: decreasing

    const processTrendChange = (previousTrendState, segmentDifference) => {
        let updatedTrendState = previousTrendState;
        let isTurnDetected = false;
        const differenceSign = getSign(segmentDifference);

        if (differenceSign === 1) { // Current segment is increasing
            if (previousTrendState === -1) { // Was decreasing, now increasing -> turn
                updatedTrendState = 0; // Reset trend after a turn
                isTurnDetected = true;
            } else { // Was 0 (initial/flat) or 1 (increasing) -> continue increasing
                updatedTrendState = 1; // Set trend to increasing
            }
        } else if (differenceSign === -1) { // Current segment is decreasing
            if (previousTrendState === 1) { // Was increasing, now decreasing -> turn
                updatedTrendState = 0; // Reset trend after a turn
                isTurnDetected = true;
            } else { // Was 0 (initial/flat) or -1 (decreasing) -> continue decreasing
                updatedTrendState = -1; // Set trend to decreasing
            }
        }
        // If differenceSign is 0 (flat), updatedTrendState remains previousTrendState.
        return { newTrend: updatedTrendState, turnOccurred: isTurnDetected };
    };

    for (let idx = 1; idx < arrayLength; idx++) {
        const previousElementValue = numericArray[idx - 1];
        const currentElementValue = numericArray[idx];
        const segmentDifference = currentElementValue - previousElementValue;

        const { newTrend, turnOccurred } = processTrendChange(currentTrend, segmentDifference);
        currentTrend = newTrend;
        if (turnOccurred) {
            turnCount++;
        }
    }

    console.log(turnCount + 1);

})(rawData);
