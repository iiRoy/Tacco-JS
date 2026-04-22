const displayOutcome = (payload) => console.log(payload);

const calculatePowerModulo = (baseVal, exponentVal, modulusVal) => {
    let resultAccumulator = 1n;
    let currentBase = BigInt(baseVal);
    let currentExponent = BigInt(exponentVal);
    const currentModulus = BigInt(modulusVal);

    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            resultAccumulator = (resultAccumulator * currentBase) % currentModulus;
        }
        currentBase = (currentBase * currentBase) % currentModulus;
        currentExponent /= 2n;
    }
    return Number(resultAccumulator);
};

const processData = (dataSource) => {
    const dataSegments = dataSource.trim().split('\n');
    const elementCount = Number(dataSegments[0]);
    const numericalSequence = dataSegments[1].split(' ').map(Number);

    const frequencyMap = numericalSequence.reduce((accumulator, value) => {
        accumulator.set(value, (accumulator.get(value) || 0) + 1);
        return accumulator;
    }, new Map());

    const orderedUniqueValues = Array.from(frequencyMap.keys()).sort((a, b) => a - b);

    let validityCheck = true;

    if (elementCount % 2 !== 0) { // Total count is odd
        const expectedUniqueCount = (elementCount - 1) / 2 + 1;
        if (orderedUniqueValues.length !== expectedUniqueCount ||
            orderedUniqueValues[0] !== 0 ||
            frequencyMap.get(0) !== 1) {
            validityCheck = false;
        } else {
            for (let index = 1; index < orderedUniqueValues.length; ++index) {
                const currentUnique = orderedUniqueValues[index];
                if (frequencyMap.get(currentUnique) !== 2) {
                    validityCheck = false;
                    break;
                }
            }
        }
    } else { // Total count is even
        const expectedUniqueCount = elementCount / 2;
        if (orderedUniqueValues.length !== expectedUniqueCount) {
            validityCheck = false;
        } else {
            for (let index = 0; index < orderedUniqueValues.length; ++index) {
                const currentUnique = orderedUniqueValues[index];
                if (frequencyMap.get(currentUnique) !== 2) {
                    validityCheck = false;
                    break;
                }
            }
        }
    }

    if (!validityCheck) {
        displayOutcome('0');
        return;
    }

    const powerFactor = (elementCount % 2 !== 0) ? (elementCount - 1) / 2 : elementCount / 2;
    const finalOutcome = calculatePowerModulo(2, powerFactor, 1000000007);
    displayOutcome(finalOutcome);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));