function AssessAtmosphericConditions(incomingStream) {
    const dataSegments = incomingStream.split('\n');

    const amountOfUnits = parseInt(dataSegments[0].split(' ')[0], 10);

    const [primaryReference, targetReference] = dataSegments[1].split(' ').map(parseFloat);

    const elevationReadings = dataSegments[2].split(' ').map(parseFloat);

    const gradientCoefficient = 0.006;

    const initialDerivedValue = primaryReference - (elevationReadings[0] * gradientCoefficient);
    const initialAbsoluteDifference = Math.abs(initialDerivedValue - targetReference);

    const evaluationOutcome = elevationReadings.reduce((accumulatedState, currentElevation, currentPosition) => {
        const calculatedTemperature = primaryReference - (currentElevation * gradientCoefficient);
        const currentAbsoluteDifference = Math.abs(calculatedTemperature - targetReference);

        if (currentAbsoluteDifference < accumulatedState.minimumObservedDelta) {
            return {
                minimumObservedDelta: currentAbsoluteDifference,
                bestMatchingLocation: currentPosition + 1
            };
        } else {
            return accumulatedState;
        }
    }, {
        minimumObservedDelta: initialAbsoluteDifference,
        bestMatchingLocation: 1
    });

    console.log(evaluationOutcome.bestMatchingLocation);
}

AssessAtmosphericConditions(require("fs").readFileSync("/dev/stdin", "utf8"));