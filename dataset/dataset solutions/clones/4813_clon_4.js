const MODULO_VAL = 1000000007;

const outputHandler = (value) => console.log(value.toString());

const calculateModularPower = (base, exponent) => {
    let resultAccumulator = 1;
    let currentBase = base % MODULO_VAL;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            resultAccumulator = (resultAccumulator * currentBase) % MODULO_VAL;
        }
        currentBase = (currentBase * currentBase) % MODULO_VAL;
        currentExponent = Math.floor(currentExponent / 2);
    }
    return resultAccumulator;
};

const executeLogic = (rawInputContent) => {
    const dataLines = rawInputContent.trim().split('\n');
    const totalElements = Number(dataLines[0]);
    const numericSequence = dataLines[1].split(' ').map(Number);

    if (totalElements === 0) {
        outputHandler(0);
        return;
    }

    const elementFrequencies = new Map();
    for (const itemValue of numericSequence) {
        elementFrequencies.set(itemValue, (elementFrequencies.get(itemValue) || 0) + 1);
    }

    let powerFactor;

    if (totalElements % 2 === 1) { // Odd total count scenario
        // Expected unique values: 0, 2, 4, ..., totalElements - 1
        // Value 0 must appear exactly once.
        // Other expected even values must appear two or more times.
        // No other values should be present.

        if (elementFrequencies.get(0) !== 1) {
            outputHandler(0);
            return;
        }

        const expectedUniqueCount = (totalElements + 1) / 2;
        if (elementFrequencies.size !== expectedUniqueCount) {
            outputHandler(0);
            return;
        }

        for (let i = 2; i < totalElements; i += 2) {
            const currentFreq = elementFrequencies.get(i);
            if (currentFreq === undefined || currentFreq < 2) {
                outputHandler(0);
                return;
            }
        }

        // Comprehensive check for any unexpected numbers or incorrect frequencies
        for (const [value, frequency] of elementFrequencies.entries()) {
            if (value === 0) continue; // Already validated
            if (value % 2 !== 0 || value < 0 || value >= totalElements) {
                outputHandler(0); // Value is not an expected positive even number within range
                return;
            }
            if (frequency < 2) { // Expected even numbers must have frequency >= 2
                outputHandler(0);
                return;
            }
        }

        powerFactor = (totalElements - 1) / 2;

    } else { // Even total count scenario
        // Expected unique values: 1, 3, 5, ..., totalElements - 1
        // All expected odd values must appear two or more times.
        // No other values should be present.

        const expectedUniqueCount = totalElements / 2;
        if (elementFrequencies.size !== expectedUniqueCount) {
            outputHandler(0);
            return;
        }

        for (let i = 1; i < totalElements; i += 2) {
            const currentFreq = elementFrequencies.get(i);
            if (currentFreq === undefined || currentFreq < 2) {
                outputHandler(0);
                return;
            }
        }

        // Comprehensive check for any unexpected numbers or incorrect frequencies
        for (const [value, frequency] of elementFrequencies.entries()) {
            if (value % 2 !== 1 || value < 0 || value >= totalElements) {
                outputHandler(0); // Value is not an expected positive odd number within range
                return;
            }
            if (frequency < 2) { // Expected odd numbers must have frequency >= 2
                outputHandler(0);
                return;
            }
        }

        powerFactor = totalElements / 2;
    }

    outputHandler(calculateModularPower(2, powerFactor));
};

executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
