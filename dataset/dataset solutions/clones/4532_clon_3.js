function determineCategory(scoreValue) {
    const CATEGORY_STEP_SIZE = 400;
    const REGULAR_COLOR_BAND_COUNT = 8;
    const OVER_THRESHOLD_BAND_INDEX = 8;

    if (scoreValue < REGULAR_COLOR_BAND_COUNT * CATEGORY_STEP_SIZE) {
        return Math.floor(scoreValue / CATEGORY_STEP_SIZE);
    } else {
        return OVER_THRESHOLD_BAND_INDEX;
    }
}

function processInputData(rawData) {
    const LINE_SEPARATOR = "\n";
    const VALUE_SEPARATOR = " ";
    const PARSE_RADIX = 10;
    const TOTAL_COLOR_BANDS = 9;

    const inputLines = rawData.split(LINE_SEPARATOR);
    const scoreValueStrings = inputLines[1].split(VALUE_SEPARATOR);

    const bandPresenceFlags = Array(TOTAL_COLOR_BANDS).fill(0);

    for (let scoreIndex = 0; scoreIndex < scoreValueStrings.length; scoreIndex++) {
        const currentScore = parseInt(scoreValueStrings[scoreIndex], PARSE_RADIX);
        const bandIdentifier = determineCategory(currentScore);

        if (bandIdentifier < TOTAL_COLOR_BANDS - 1) {
            bandPresenceFlags[bandIdentifier] = 1;
        } else {
            bandPresenceFlags[bandIdentifier]++;
        }
    }

    let distinctRegularBandCount = 0;
    for (let bandIdx = 0; bandIdx < TOTAL_COLOR_BANDS - 1; bandIdx++) {
        distinctRegularBandCount += bandPresenceFlags[bandIdx];
    }

    const overThresholdBandOccurrences = bandPresenceFlags[TOTAL_COLOR_BANDS - 1];
    let maximumPossibleColors = distinctRegularBandCount + overThresholdBandOccurrences;
    maximumPossibleColors = Math.min(maximumPossibleColors, TOTAL_COLOR_BANDS - 1);

    const minimumPossibleColors = distinctRegularBandCount;

    console.log('%d %d', minimumPossibleColors, maximumPossibleColors);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
