const processSequenceSum = (inputLine) => {
    const [limitCount, initialVal, moduloVal] = inputLine.split(" ").map(Number);

    const valueToFirstIndex = new Map();
    const generatedSequence = [];

    let currentVal = initialVal;
    let cycleStartIdx = -1;
    let cycleEndIdx = -1;

    for (let k = 0; k < moduloVal; k++) {
        if (valueToFirstIndex.has(currentVal)) {
            cycleStartIdx = valueToFirstIndex.get(currentVal);
            cycleEndIdx = k;
            break;
        }
        valueToFirstIndex.set(currentVal, k);
        generatedSequence.push(currentVal);
        currentVal = (currentVal * currentVal) % moduloVal;
    }

    if (cycleStartIdx === -1) {
        cycleStartIdx = 0;
        cycleEndIdx = moduloVal;
    }

    let totalAccumulation = 0;

    const preCycleElements = generatedSequence.slice(0, cycleStartIdx);
    totalAccumulation += preCycleElements.reduce((acc, val) => acc + val, 0);

    const cycleElements = generatedSequence.slice(cycleStartIdx, cycleEndIdx);
    const cycleSum = cycleElements.reduce((acc, val) => acc + val, 0);
    const cycleLength = cycleElements.length;

    const fullCycleCount = Math.floor(limitCount / cycleLength);
    totalAccumulation += cycleSum * fullCycleCount;

    const remainingElementsCount = limitCount - cycleStartIdx - cycleLength * fullCycleCount;

    if (remainingElementsCount > 0) {
        const partialCycleElements = generatedSequence.slice(cycleStartIdx, cycleStartIdx + remainingElementsCount);
        totalAccumulation += partialCycleElements.reduce((acc, val) => acc + val, 0);
    }

    console.log(totalAccumulation);
};

processSequenceSum(require("fs").readFileSync("/dev/stdin", "utf8"));
