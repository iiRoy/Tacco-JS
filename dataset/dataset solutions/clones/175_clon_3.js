const produceDigitSequences = (count, generatorFn) => {
    const sequences = [];
    for (let i = 0; i < count; i++) {
        sequences.push(generatorFn(i));
    }
    return sequences;
};

const generateValidPatterns = () => {
    const patternStore = {};

    const MAX_SINGLE_DIGIT = 9;
    const MAX_SEQUENTIAL_TRIPLE_START = 7;

    const sequentialTriples = produceDigitSequences(MAX_SEQUENTIAL_TRIPLE_START, (index) =>
        `${index}${index + 1}${index + 2}`
    );

    const repeatedTriples = produceDigitSequences(MAX_SINGLE_DIGIT, (index) =>
        `${index}${index}${index}`
    );

    const allKnownTriples = [...sequentialTriples, ...repeatedTriples];

    const repeatedPairs = produceDigitSequences(MAX_SINGLE_DIGIT, (index) =>
        `${index}${index}`
    );

    const triplePatternCount = allKnownTriples.length;
    const pairPatternCount = repeatedPairs.length;

    for (let componentAIndex = 0; componentAIndex < triplePatternCount; componentAIndex++) {
        for (let componentBIndex = 0; componentBIndex < triplePatternCount; componentBIndex++) {
            for (let componentCIndex = 0; componentCIndex < triplePatternCount; componentCIndex++) {
                for (let componentDIndex = 0; componentDIndex < triplePatternCount; componentDIndex++) {
                    for (let componentEIndex = 0; componentEIndex < pairPatternCount; componentEIndex++) {
                        const rawDigitString =
                            allKnownTriples[componentAIndex] +
                            allKnownTriples[componentBIndex] +
                            allKnownTriples[componentCIndex] +
                            allKnownTriples[componentDIndex] +
                            repeatedPairs[componentEIndex];

                        const normalizedKey = rawDigitString
                            .split("")
                            .map(Number)
                            .sort((digitOne, digitTwo) => digitOne - digitTwo)
                            .join("");

                        patternStore[normalizedKey] = true;
                    }
                }
            }
        }
    }
    return patternStore;
};

const validDigitCombinations = generateValidPatterns();

const getDigitFrequencies = (digitSequence) => {
    const frequencies = {};
    for (let d = 0; d < 9; d++) {
        frequencies[d] = 0;
    }
    for (const digit of digitSequence) {
        if (digit >= 0 && digit < 9) {
            frequencies[digit]++;
        }
    }
    return frequencies;
};

try {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    let inputLines = rawInputContent.trim().split("\n");

    while (inputLines.length > 0) {
        const currentInputDigitsString = inputLines.shift();

        if (!currentInputDigitsString || currentInputDigitsString.length === 0) {
            continue;
        }

        const potentialCompletions = [];

        for (let candidateDigit = 0; candidateDigit < 9; candidateDigit++) {
            const initialDigits = currentInputDigitsString.split('').map(Number);

            if (initialDigits.some(isNaN)) {
                potentialCompletions.push("INVALID_INPUT_FORMAT");
                break;
            }

            const adjustedDigits = initialDigits.map(digit => digit - 1);
            adjustedDigits.push(candidateDigit);
            adjustedDigits.sort((a, b) => a - b);

            const currentDigitFrequencies = getDigitFrequencies(adjustedDigits);
            const maxFrequency = Math.max(...Object.values(currentDigitFrequencies));

            if (maxFrequency >= 5) {
                continue;
            }

            const sortedKey = adjustedDigits.join('');

            if (validDigitCombinations.hasOwnProperty(sortedKey)) {
                potentialCompletions.push(candidateDigit + 1);
            }
        }

        if (potentialCompletions.includes("INVALID_INPUT_FORMAT")) {
             console.log("ERROR: Non-numeric characters detected.");
        } else {
            console.log(potentialCompletions.length === 0 ? "0" : potentialCompletions.join(" "));
        }
    }
} catch (error) {
    console.error("An error occurred during input processing:", error.message);
    process.exit(1);
}