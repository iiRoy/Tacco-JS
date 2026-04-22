const ProcessSystem = (rawInputData) => {
    const dataSegments = rawInputData.split('\n');
    const totalEntities = Number.parseInt(dataSegments[0], 10);
    const desiredParities = dataSegments.slice(1, totalEntities + 1).map(Number.parseInt);

    const systemOutcome = {
        entityConfiguration: Array(totalEntities).fill(0),
        activeEntityReferences: []
    };

    const entitySequence = Array.from({
        length: totalEntities
    }, (_, idx) => totalEntities - idx);

    const finalStateAccumulator = entitySequence.reduce((acc, currentEntityIdentifier) => {
        const multipleContributors = Array.from({
            length: Math.floor(totalEntities / currentEntityIdentifier) - 1
        }, (_, idx) => (idx + 2) * currentEntityIdentifier)
            .reduce((sum, multipleIdentifier) => {
                return sum + acc.entityConfiguration[multipleIdentifier - 1];
            }, 0);

        const derivedState = (desiredParities[currentEntityIdentifier - 1] + multipleContributors) % 2;

        acc.entityConfiguration[currentEntityIdentifier - 1] = derivedState;

        if (derivedState === 1) {
            acc.activeEntityReferences.push(currentEntityIdentifier);
        }

        return acc;
    }, systemOutcome);

    const countOfActivations = finalStateAccumulator.activeEntityReferences.length;
    const orderedActiveReferences = finalStateAccumulator.activeEntityReferences.reverse();

    if (countOfActivations > 0) {
        console.log('%d', countOfActivations);
        console.log(orderedActiveReferences.join(' '));
    } else {
        console.log('%d', 0);
    }
};
ProcessSystem(require("fs").readFileSync("/dev/stdin", "utf8"));