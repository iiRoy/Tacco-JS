const processInputData = (rawTextContent) => {
    const splitLines = rawTextContent.trim().split('\n');
    const [configRow, timingsRow] = splitLines;

    const [quantity, spanValue] = configRow.split(' ').map(Number);
    const activityBeginnings = timingsRow.split(' ').map(Number);

    return {
        eventQuantity: quantity,
        intervalSpan: spanValue,
        activityStarts: activityBeginnings
    };
};

const consolidateTimePeriods = (periodCollection) => {
    if (periodCollection.length === 0) {
        return [];
    }

    const orderedPeriods = [...periodCollection].sort((a, b) => a.startMoment - b.startMoment);

    const resultingPeriods = [];
    let currentAggregatedPeriod = { ...orderedPeriods[0] }; // Clone to avoid modifying original

    for (let idx = 1; idx < orderedPeriods.length; idx++) {
        const nextPeriod = orderedPeriods[idx];

        if (nextPeriod.startMoment <= currentAggregatedPeriod.endMoment) {
            // Overlap or touch, extend the current aggregated period
            currentAggregatedPeriod.endMoment = Math.max(currentAggregatedPeriod.endMoment, nextPeriod.endMoment);
        } else {
            // No overlap, finalize current aggregated period and begin a new one
            resultingPeriods.push(currentAggregatedPeriod);
            currentAggregatedPeriod = { ...nextPeriod }; // Clone
        }
    }
    resultingPeriods.push(currentAggregatedPeriod); // Add the very last aggregated period

    return resultingPeriods;
};

function determineTotalActiveTime(rawTextContent) {
    const { intervalSpan, activityStarts } = processInputData(rawTextContent);

    // Construct all individual intervals, including the initial baseline period
    const allIndividualPeriods = activityStarts.map(entryPoint => ({
        startMoment: entryPoint,
        endMoment: entryPoint + intervalSpan
    }));
    
    // The original logic effectively includes a base interval [0, duration]
    const fullPeriodSet = [{ startMoment: 0, endMoment: intervalSpan }, ...allIndividualPeriods];

    const mergedPeriodSet = consolidateTimePeriods(fullPeriodSet);

    // Sum the durations of all consolidated periods
    const cumulativeActiveTime = mergedPeriodSet.reduce((acc, currentPeriod) => 
        acc + (currentPeriod.endMoment - currentPeriod.startMoment), 0
    );

    console.log(cumulativeActiveTime);
}

determineTotalActiveTime(require("fs").readFileSync("/dev/stdin", "utf8"));