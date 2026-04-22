function processData(dataSource) {
    const initialScalars = dataSource[0].split(' ').map(Number);
    const elementCount = initialScalars[0];
    const reductionAllowance = initialScalars[1];

    const firstCollection = dataSource[1].split(' ').map(Number);
    const secondCollection = dataSource[2].split(' ').map(Number);

    firstCollection.sort((elemA, elemB) => elemB - elemA);
    secondCollection.sort((elemA, elemB) => elemA - elemB);

    const workItems = Array.from({ length: elementCount }, (_, idxVar) => ({
        baseComponent: firstCollection[idxVar],
        factorComponent: secondCollection[idxVar]
    }));

    let maxInitialEvaluation = 0;
    for (const item of workItems) {
        maxInitialEvaluation = Math.max(maxInitialEvaluation, item.baseComponent * item.factorComponent);
    }

    const canAchieveTarget = (desiredMaximum, reductionCeiling) => {
        let necessaryReductions = 0;
        for (const item of workItems) {
            const currentEvaluation = item.baseComponent * item.factorComponent;
            if (currentEvaluation <= desiredMaximum) {
                continue;
            }
            
            // If factorComponent is 0, currentEvaluation would be 0, satisfying currentEvaluation <= desiredMaximum.
            // So this path is only taken if factorComponent is positive.
            const allowedBaseForTarget = Math.floor(desiredMaximum / item.factorComponent);
            necessaryReductions += Math.max(0, item.baseComponent - allowedBaseForTarget);
        }
        return necessaryReductions <= reductionCeiling;
    };

    let minimumPossible = 0;
    let maximumPossible = maxInitialEvaluation;
    let finalOptimal = maxInitialEvaluation;

    while (minimumPossible <= maximumPossible) {
        const testValue = Math.floor((minimumPossible + maximumPossible) / 2);
        if (canAchieveTarget(testValue, reductionAllowance)) {
            finalOptimal = testValue;
            maximumPossible = testValue - 1;
        } else {
            minimumPossible = testValue + 1;
        }
    }

    console.log(finalOptimal);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));