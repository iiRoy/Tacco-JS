function primaryExecution(rawData) {
    const [valA, valB, valC] = rawData.map(Number);

    function* processResourceReduction(initialFirst, initialSecond, initialResource) {
        let currentDimensions = {
            first: initialFirst,
            second: initialSecond,
            resource: initialResource
        };

        while (currentDimensions.resource > 0) {
            yield;

            const isFirstDominant = currentDimensions.first > currentDimensions.second;

            const decrementFirst = isFirstDominant ? 0 : 1;
            const decrementSecond = isFirstDominant ? 1 : 0;
            const resourceDrain = isFirstDominant ? currentDimensions.first : currentDimensions.second;

            currentDimensions.first -= decrementFirst;
            currentDimensions.second -= decrementSecond;
            currentDimensions.resource -= resourceDrain;
        }
    }

    let operationCounter = 0;
    const reductionIterator = processResourceReduction(valA, valB, valC);

    for (const _ of reductionIterator) {
        operationCounter++;
    }

    console.log(operationCounter);
}

primaryExecution(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
