function calculateAggregateValue(sourceData) {
    const dataSegments = sourceData.split('\n');
    const [, secondParamStr] = dataSegments[0].split(' ');
    const referenceDuration = Number(secondParamStr);

    const eventTimings = dataSegments[1].split(' ').map(Number);

    let cumulativeOutcome = 0;

    if (eventTimings.length > 0) {
        cumulativeOutcome += Math.min(referenceDuration, eventTimings[0]);

        const intermediateSum = eventTimings.slice(1).reduce((partialSum, currentMoment, positionIndex) => {
            const priorMoment = eventTimings[positionIndex];
            const momentSpan = currentMoment - priorMoment;
            return partialSum + Math.min(referenceDuration, momentSpan);
        }, 0);

        cumulativeOutcome += intermediateSum;
    }

    cumulativeOutcome += referenceDuration;

    console.log(cumulativeOutcome);
}

calculateAggregateValue(require("fs").readFileSync("/dev/stdin", "utf8"));