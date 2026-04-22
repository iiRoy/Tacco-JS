function processInputData(dataSource) {
    const parsedEntries = dataSource.trim().split("\n").map(lineSegment => lineSegment.split(" "));

    const initialValues = parsedEntries[0];
    const objectQuantity = Number(initialValues[0]);
    const maxDuration = Number(initialValues[1]);

    const objectCollection = parsedEntries.slice(1).map(entryParts => ({
        durationCost: Number(entryParts[0]),
        rewardValue: Number(entryParts[1])
    }));

    objectCollection.sort((entityA, entityB) => entityA.rewardValue - entityB.rewardValue);

    const resultRegistry = new Map();

    function calculateOptimalReward(entityIndex, currentDuration) {
        if (currentDuration < 0) {
            return -Infinity;
        }
        if (entityIndex < 0) {
            return 0;
        }

        const lookupKey = `${entityIndex},${currentDuration}`;
        if (resultRegistry.has(lookupKey)) {
            return resultRegistry.get(lookupKey);
        }

        const currentEntity = objectCollection[entityIndex];

        const rewardExcludingCurrent = calculateOptimalReward(entityIndex - 1, currentDuration);
        const rewardIncludingCurrent = calculateOptimalReward(entityIndex - 1, currentDuration - currentEntity.durationCost) + currentEntity.rewardValue;

        const bestRewardForState = Math.max(rewardExcludingCurrent, rewardIncludingCurrent);

        resultRegistry.set(lookupKey, bestRewardForState);
        return bestRewardForState;
    }

    const standardOutcome = calculateOptimalReward(objectQuantity - 2, maxDuration);

    let finalObjectSpecificOutcome = 0;
    if (objectQuantity > 0) {
        const ultimateObject = objectCollection[objectQuantity - 1];
        finalObjectSpecificOutcome = calculateOptimalReward(objectQuantity - 2, maxDuration - 1) + ultimateObject.rewardValue;
    }

    const overallOptimal = Math.max(standardOutcome, finalObjectSpecificOutcome);

    console.log(overallOptimal);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));