function calculateMinimalComponents(initialValue) {
    const targetAmount = parseInt(String(initialValue), 10) || 0;
    if (targetAmount === 0) return 0;

    const availableUnits = [1, 6, 9, 36, 81, 216, 729, 1296, 6561, 7776, 46656, 59049];

    const leastUnitsForSum = new Map();
    const processingStack = [];

    leastUnitsForSum.set(0, 0);
    processingStack.push([0, 0]);

    let queuePointer = 0;
    while (queuePointer < processingStack.length) {
        const [currentTotal, unitsUsed] = processingStack[queuePointer++];

        if (unitsUsed > leastUnitsForSum.get(currentTotal)) {
            continue;
        }

        if (currentTotal === targetAmount) {
            return unitsUsed;
        }

        for (const unitValue of availableUnits) {
            const nextTotal = currentTotal + unitValue;
            const nextUnits = unitsUsed + 1;

            if (nextTotal <= targetAmount) {
                if (!leastUnitsForSum.has(nextTotal) || nextUnits < leastUnitsForSum.get(nextTotal)) {
                    leastUnitsForSum.set(nextTotal, nextUnits);
                    processingStack.push([nextTotal, nextUnits]);
                }
            }
        }
    }

    return -1;
}

const inputDataContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateMinimalComponents(inputDataContent.trim()));