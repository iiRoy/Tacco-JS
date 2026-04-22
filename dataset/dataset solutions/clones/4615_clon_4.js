function ProcessInput(inputData) {
    const numericValues = inputData.match(/\d+/g).map(Number);
    const totalEventsCount = numericValues[0];
    const durationLimit = numericValues[1];
    const eventSequence = numericValues.slice(2);

    if (totalEventsCount === 0) {
        console.log(0);
        return;
    }

    if (totalEventsCount === 1) {
        console.log(durationLimit);
        return;
    }

    const calculationResult = eventSequence.slice(1).reduce((currentAggregate, currentMoment) => {
        const priorMoment = currentAggregate.lastKnownMoment;
        const intervalDuration = currentMoment - priorMoment;

        const updatedAccumulator = (intervalDuration < durationLimit)
            ? currentMoment
            : (currentAggregate.cumulativeSum + durationLimit);

        return {
            cumulativeSum: updatedAccumulator,
            lastKnownMoment: currentMoment
        };
    }, { cumulativeSum: 0, lastKnownMoment: eventSequence[0] });

    console.log(calculationResult.cumulativeSum + durationLimit);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));