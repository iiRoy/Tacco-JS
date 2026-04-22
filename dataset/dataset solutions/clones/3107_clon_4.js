const obtainNumericInput = async () => {
    const readline = await import('readline/promises');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const line = await rl.question('');
    rl.close();
    return parseInt(line, 10);
};

const MOD_VALUE = 1000000007;
const DIGIT_COUNT = 4;
const DIGIT_POSSIBILITIES = [0, 1, 2, 3];

const packDigits = (first, second, third, fourth) => {
    return first * (DIGIT_COUNT ** 3) + second * (DIGIT_COUNT ** 2) + third * (DIGIT_COUNT ** 1) + fourth;
};

const buildExclusionSet = () => {
    const prohibitedCombinations = new Set();
    for (let currentDigit of DIGIT_POSSIBILITIES) {
        prohibitedCombinations.add(packDigits(0, 2, 1, currentDigit));
        prohibitedCombinations.add(packDigits(currentDigit, 0, 2, 1));
        prohibitedCombinations.add(packDigits(0, 1, 2, currentDigit));
        prohibitedCombinations.add(packDigits(currentDigit, 0, 1, 2));
        prohibitedCombinations.add(packDigits(2, 0, 1, currentDigit));
        prohibitedCombinations.add(packDigits(currentDigit, 2, 0, 1));
        prohibitedCombinations.add(packDigits(0, currentDigit, 2, 1));
        prohibitedCombinations.add(packDigits(0, 2, currentDigit, 1));
    }
    return prohibitedCombinations;
};

const executeSequenceCounting = async () => {
    const sequenceLength = await obtainNumericInput();

    if (sequenceLength === 3) {
        console.log(61);
        return;
    }

    const forbiddenPatterns = buildExclusionSet();
    let countsForPreviousLength = new Uint32Array(DIGIT_COUNT ** DIGIT_COUNT);

    for (let d1 of DIGIT_POSSIBILITIES) {
        for (let d2 of DIGIT_POSSIBILITIES) {
            for (let d3 of DIGIT_POSSIBILITIES) {
                for (let d4 of DIGIT_POSSIBILITIES) {
                    const currentEncodedKey = packDigits(d1, d2, d3, d4);
                    if (!forbiddenPatterns.has(currentEncodedKey)) {
                        countsForPreviousLength[currentEncodedKey] = 1;
                    }
                }
            }
        }
    }

    for (let currentLen = 5; currentLen <= sequenceLength; ++currentLen) {
        const countsForCurrentLength = new Uint32Array(DIGIT_COUNT ** DIGIT_COUNT);

        for (let d1 of DIGIT_POSSIBILITIES) {
            for (let d2 of DIGIT_POSSIBILITIES) {
                for (let d3 of DIGIT_POSSIBILITIES) {
                    for (let d4 of DIGIT_POSSIBILITIES) {
                        const currentEncodedKey = packDigits(d1, d2, d3, d4);

                        if (forbiddenPatterns.has(currentEncodedKey)) {
                            countsForCurrentLength[currentEncodedKey] = 0;
                            continue;
                        }

                        let accumulatedCount = 0;
                        for (let previousFirstDigit of DIGIT_POSSIBILITIES) {
                            const previousEncodedKey = packDigits(previousFirstDigit, d1, d2, d3);
                            accumulatedCount = (accumulatedCount + countsForPreviousLength[previousEncodedKey]) % MOD_VALUE;
                        }
                        countsForCurrentLength[currentEncodedKey] = accumulatedCount;
                    }
                }
            }
        }
        countsForPreviousLength = countsForCurrentLength;
    }

    let finalTotal = 0;
    for (let i = 0; i < (DIGIT_COUNT ** DIGIT_COUNT); ++i) {
        finalTotal = (finalTotal + countsForPreviousLength[i]) % MOD_VALUE;
    }

    console.log(finalTotal);
};

executeSequenceCounting();