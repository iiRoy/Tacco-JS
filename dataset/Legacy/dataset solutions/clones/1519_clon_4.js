const processSequenceSum = (inputString) => {
    const [targetN, initialVal, modulusVal] = inputString.split(" ").map(Number);

    const sequenceValues = [];
    const valueToFirstIndex = new Map();

    let currentTerm = initialVal;
    let cycleStartIdx = -1;
    let cycleEndIdx = -1;

    for (let k = 0; k < modulusVal; k++) {
        if (valueToFirstIndex.has(currentTerm)) {
            cycleStartIdx = valueToFirstIndex.get(currentTerm);
            cycleEndIdx = k;
            break;
        }

        valueToFirstIndex.set(currentTerm, k);
        sequenceValues.push(currentTerm);

        currentTerm = (currentTerm * currentTerm) % modulusVal;
    }

    let totalAccumulation = 0;

    if (targetN === 0) {
        console.log(0);
        return;
    }

    if (cycleStartIdx === -1) {
        totalAccumulation = sequenceValues.slice(0, Math.min(targetN, sequenceValues.length)).reduce((sum, val) => sum + val, 0);
    } else {
        const cycleLength = cycleEndIdx - cycleStartIdx;

        const preCycleElementsCount = Math.min(targetN, cycleStartIdx);
        totalAccumulation += sequenceValues.slice(0, preCycleElementsCount).reduce((sum, val) => sum + val, 0);

        if (targetN > cycleStartIdx) {
            let remainingTermsToSum = targetN - cycleStartIdx;

            const sumOfOneCycle = sequenceValues.slice(cycleStartIdx, cycleEndIdx).reduce((sum, val) => sum + val, 0);

            const fullCyclesCount = Math.floor(remainingTermsToSum / cycleLength);
            totalAccumulation += fullCyclesCount * sumOfOneCycle;
            remainingTermsToSum -= fullCyclesCount * cycleLength;

            totalAccumulation += sequenceValues.slice(cycleStartIdx, cycleStartIdx + remainingTermsToSum).reduce((sum, val) => sum + val, 0);
        }
    }

    console.log(totalAccumulation);
};

processSequenceSum(require("fs").readFileSync("/dev/stdin", "utf8"));
