const processInputAndSolve = (sourceLines) => {
    const rawData = sourceLines.map(line => line.trim().split(/\s+/).map(Number));
    const paramSet = rawData[0];
    const unitCount = paramSet[0];
    const fixedInterval = paramSet[1];

    const itemDetails = rawData.slice(1).map(item => {
        const baseMeasure = item[0];
        const passiveYield = item[1];
        const activeYield = item[2];
        const initialScore = baseMeasure * passiveYield;
        const potentialImprovement = (fixedInterval - baseMeasure) * activeYield;
        // Storing as an array for different syntax: [baseMeasure, passiveYield, activeYield, initialScore, potentialImprovement]
        return [baseMeasure, passiveYield, activeYield, initialScore, potentialImprovement];
    });

    // Calculate the total initial score if no "learning" happens for any item
    const initialScoreTarget = itemDetails.reduce((sum, detail) => sum + detail[3], 0);

    // Sort items by their potential improvement in descending order
    itemDetails.sort((a, b) => b[4] - a[4]);

    let totalEffortAccumulated = 0;
    let currentScoreDeficit = initialScoreTarget; // This variable will be mutated

    let pivotElementIndex = itemDetails.findIndex((detail) => {
        const initialScore = detail[3];
        const potentialImprovement = detail[4];
        const fullContribution = initialScore + potentialImprovement; // Total score if item is fully "learned"

        if (fullContribution >= currentScoreDeficit) {
            // This item can cover the remaining deficit, it's the pivot
            return true;
        } else {
            // Fully "learn" this item and reduce the deficit
            currentScoreDeficit -= fullContribution;
            totalEffortAccumulated += fixedInterval;
            return false; // Continue to next item
        }
    });

    // If no single pivot element was found (findIndex returned -1),
    // it means all elements were fully learned, and currentScoreDeficit holds the remaining deficit (should be <= 0).
    if (pivotElementIndex === -1) {
        pivotElementIndex = unitCount; // Set to unitCount to indicate no specific pivot, all items processed.
    }

    let minimumAdjustmentTime;
    if (currentScoreDeficit <= 0) {
        // If the deficit is already covered or overshot, no additional time is needed.
        minimumAdjustmentTime = 0;
    } else {
        // Otherwise, find the minimum time from the pivot element or subsequent ones.
        minimumAdjustmentTime = itemDetails.slice(pivotElementIndex).reduce((minDuration, detail) => {
            const baseMeasure = detail[0];
            const activeYield = detail[2];
            const initialScore = detail[3];

            // Calculate points needed beyond the base score of this item
            const requiredExtraPoints = currentScoreDeficit - initialScore;
            let calculatedTime;

            if (activeYield === 0) {
                // If activeYield is 0, no additional points can be gained through learning.
                // If requiredExtraPoints > 0, it's impossible (infinite time).
                // If requiredExtraPoints <= 0, no additional time is needed beyond baseMeasure.
                calculatedTime = (requiredExtraPoints > 0) ? Number.MAX_SAFE_INTEGER : baseMeasure;
            } else {
                // Calculate the time required to achieve the requiredExtraPoints
                // This assumes time can be fractional, then rounds up.
                calculatedTime = baseMeasure + Math.ceil(requiredExtraPoints / activeYield);
            }
            return Math.min(minDuration, calculatedTime);
        }, Number.MAX_SAFE_INTEGER);
    }
    
    // Add the final adjustment time to the accumulated effort
    totalEffortAccumulated += minimumAdjustmentTime;

    console.log(totalEffortAccumulated);
};

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));