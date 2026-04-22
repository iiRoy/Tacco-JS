const findLargestDivisor = (val, base) => {
    let currentMult = base;
    let maxFound = 0;
    while (currentMult <= val) {
        maxFound = currentMult;
        if (currentMult > Number.MAX_SAFE_INTEGER / base) {
            break;
        }
        currentMult *= base;
    }
    return maxFound;
};

const processDivisorType = (total, remaining, base) => {
    const divisor = findLargestDivisor(remaining, base);
    if (divisor > 0) {
        return {
            newTotal: total + 1,
            newRemaining: remaining - divisor
        };
    } else {
        return {
            newTotal: total,
            newRemaining: remaining
        };
    }
};

const ExecuteComputation = (dataStream) => {
    let valueHolder = Number(dataStream);
    let cumulativeSum = 0;

    const resultA = processDivisorType(cumulativeSum, valueHolder, 9);
    cumulativeSum = resultA.newTotal;
    valueHolder = resultA.newRemaining;

    const resultB = processDivisorType(cumulativeSum, valueHolder, 6);
    cumulativeSum = resultB.newTotal;
    valueHolder = resultB.newRemaining;

    cumulativeSum += valueHolder;

    return cumulativeSum;
};

const programWrapper = (data) => {
    console.log(ExecuteComputation(data));
};

programWrapper(require("fs").readFileSync("/dev/stdin", "utf8"));