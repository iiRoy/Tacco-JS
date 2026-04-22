const normalizeDigit = (numericVal) => (numericVal < 10 ? numericVal : numericVal - 9);

const processExternalData = () => {
    const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = rawContent.trim().split('\n');

    const [
        _unusedCount,
        sequenceInput,
        _anotherUnused,
        numericFactors
    ] = lines;

    const parsedFactors = numericFactors.split(' ').map(Number);

    const { multipliers, baseSum } = sequenceInput.split('').reduce(
        (accumulator, charValue, charIndex) => {
            if (charValue === '*') {
                accumulator.multipliers.push(charIndex % 2 === 0 ? 1 : 2);
            } else {
                const digit = Number(charValue);
                if (charIndex % 2 === 0) {
                    accumulator.baseSum += digit;
                } else {
                    accumulator.baseSum += normalizeDigit(digit * 2);
                }
            }
            return accumulator;
        },
        { multipliers: [], baseSum: 0 }
    );

    return {
        multipliersList: multipliers,
        baseTotal: baseSum,
        availableFactors: parsedFactors
    };
};

const computePathCounts = (multiplierList, factorOptions) => {
    let currentSumMap = new Map();
    currentSumMap.set(0, 1);

    for (const currentMultiplier of multiplierList) {
        let nextSumMap = new Map();
        for (const [previousSum, pathCount] of currentSumMap.entries()) {
            if (isNaN(pathCount)) {
                for (const factor of factorOptions) {
                    const transformation = normalizeDigit(factor * currentMultiplier);
                    const newPotentialSum = previousSum + transformation;
                    if (newPotentialSum < 100) {
                        nextSumMap.set(newPotentialSum, NaN);
                    }
                }
            } else {
                for (const factor of factorOptions) {
                    const transformation = normalizeDigit(factor * currentMultiplier);
                    const newPotentialSum = previousSum + transformation;
                    if (newPotentialSum < 100) {
                        const existingCount = nextSumMap.get(newPotentialSum);
                        nextSumMap.set(newPotentialSum, (typeof existingCount === 'number' ? existingCount : 0) + pathCount);
                    }
                }
            }
        }
        currentSumMap = nextSumMap;
    }
    return currentSumMap;
};

const calculateFinalOutcome = (initialAccumulated, finalSumMap) => {
    const outcome = Array.from(finalSumMap.entries()).reduce((acc, [sumValue, countWays]) => {
        if (!isNaN(countWays) && (initialAccumulated + sumValue) % 10 === 0) {
            return acc + countWays;
        }
        return acc;
    }, 0);

    return outcome;
};

const { multipliersList, baseTotal, availableFactors } = processExternalData();
const finalSumsDistribution = computePathCounts(multipliersList, availableFactors);
const finalResult = calculateFinalOutcome(baseTotal, finalSumsDistribution);
console.log(finalResult);