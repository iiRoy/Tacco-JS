function processInputData(rawData) {
    const firstLineParts = rawData[0].split(/\s/);
    const itemCount = parseInt(firstLineParts[0]);
    const maxStudyTimePerItem = parseInt(firstLineParts[1]);

    const parseItemDetails = (lineContent) => {
        const splitParts = lineContent.split(/\s/);
        const baseTime = parseInt(splitParts[0]);
        const lowPriorityPoints = parseInt(splitParts[1]);
        const unitPointsPerExtraTime = parseInt(splitParts[2]);

        const itemObject = {
            baseTime: baseTime,
            lowPriorityPoints: lowPriorityPoints,
            unitPointsPerExtraTime: unitPointsPerExtraTime,
        };
        itemObject.basePoints = itemObject.baseTime * itemObject.lowPriorityPoints;
        itemObject.maxPotentialGain = (maxStudyTimePerItem - itemObject.baseTime) * itemObject.unitPointsPerExtraTime;

        return itemObject;
    };

    const studyItems = [];
    for (let i = 1; i < rawData.length; i++) {
        studyItems.push(parseItemDetails(rawData[i]));
    }

    studyItems.sort((itemA, itemB) => itemB.maxPotentialGain - itemA.maxPotentialGain);

    const totalBasePoints = studyItems.reduce((sum, currentItem) => sum + currentItem.basePoints, 0);

    let remainingDifference = totalBasePoints;
    let totalStudyDuration = 0;
    let breakPointIndex = 0;

    const fullItemStudyDuration = maxStudyTimePerItem;

    for (let i = 0; i < itemCount; i++) {
        const currentItem = studyItems[i];
        const combinedItemValue = currentItem.maxPotentialGain + currentItem.basePoints;

        remainingDifference -= combinedItemValue;

        if (remainingDifference <= 0) {
            remainingDifference += combinedItemValue;
            breakPointIndex = i;
            break;
        } else {
            totalStudyDuration += fullItemStudyDuration;
        }
    }

    let minAdjustmentTime = Number.MAX_SAFE_INTEGER;
    const maximumAllowedTimePerItem = maxStudyTimePerItem;

    for (let i = breakPointIndex; i < itemCount; i++) {
        const currentItem = studyItems[i];
        const pointsNeededBeyondBase = remainingDifference - currentItem.basePoints;

        const effectivePointsToCover = Math.max(0, pointsNeededBeyondBase);
        const rawAdditionalTime = effectivePointsToCover / currentItem.unitPointsPerExtraTime;
        const roundedAdditionalTime = Math.ceil(rawAdditionalTime);

        const calculatedItemTotalTime = currentItem.baseTime + roundedAdditionalTime;
        const actualItemStudyTime = Math.min(calculatedItemTotalTime, maximumAllowedTimePerItem);

        minAdjustmentTime = Math.min(minAdjustmentTime, actualItemStudyTime);
    }

    totalStudyDuration += minAdjustmentTime;

    console.log(totalStudyDuration);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));
