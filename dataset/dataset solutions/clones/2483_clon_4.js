function processChallenge(dataString) {
    const parsedLines = dataString.trim().split('\n');

    const firstLineData = parsedLines[0].match(/\d+/g).map(Number);
    const elementCount = firstLineData[0];
    const maxAllowedReductions = firstLineData[1];

    const valuesPrimary = parsedLines[1].match(/\d+/g).map(Number).sort((a, b) => a - b);
    const valuesSecondary = parsedLines[2].match(/\d+/g).map(Number).sort((a, b) => b - a);

    const initialUpperBound = valuesPrimary.reduce((currentMax, primaryItem, idx) => {
        return Math.max(currentMax, primaryItem * valuesSecondary[idx]);
    }, 0);

    const isAchievable = (testValue) => {
        const totalReductionCost = valuesPrimary.reduce((acc, primaryItem, idx) => {
            const requiredReduction = primaryItem - Math.floor(testValue / valuesSecondary[idx]);
            return acc + Math.max(0, requiredReduction);
        }, 0);
        return totalReductionCost <= maxAllowedReductions;
    };

    const findOptimalMaximumValue = (low, high) => {
        if (high - low <= 1) {
            return high;
        }

        const trialValue = Math.ceil((low + high) / 2);

        if (isAchievable(trialValue)) {
            return findOptimalMaximumValue(low, trialValue);
        } else {
            return findOptimalMaximumValue(trialValue, high);
        }
    };

    const finalResult = findOptimalMaximumValue(-1, initialUpperBound);

    console.log(finalResult);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));