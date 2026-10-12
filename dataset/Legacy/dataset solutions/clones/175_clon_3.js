const getSortedNumericString = (inputStr) => {
    return inputStr.split("").map(Number).sort((a, b) => a - b).join("");
};

function generateValidCombinations() {
    const validCombinationSet = {};

    const segmentSourceA = "012,123,234,345,456,567,678";
    const segmentSourceB = "000,111,222,333,444,555,666,777,888";
    const suffixSourceC = "00,11,22,33,44,55,66,77,88";

    const initialSegmentsA = segmentSourceA.split(",");
    const initialSegmentsB = segmentSourceB.split(",");
    const combinedSegments = initialSegmentsA.concat(initialSegmentsB);
    const finalSuffixes = suffixSourceC.split(",");

    const segmentCount = combinedSegments.length;
    const suffixCount = finalSuffixes.length;

    for (let idxA = 0; idxA < segmentCount; idxA++) {
        for (let idxB = 0; idxB < segmentCount; idxB++) {
            for (let idxC = 0; idxC < segmentCount; idxC++) {
                for (let idxD = 0; idxD < segmentCount; idxD++) {
                    for (let suffixIdx = 0; suffixIdx < suffixCount; suffixIdx++) {
                        const rawCombinationString = combinedSegments[idxA] + combinedSegments[idxB] + combinedSegments[idxC] + combinedSegments[idxD] + finalSuffixes[suffixIdx];
                        const processedString = getSortedNumericString(rawCombinationString);
                        validCombinationSet[processedString] = true;
                    }
                }
            }
        }
    }
    return validCombinationSet;
}

const parseLineToNumbers = (lineString) => {
    return lineString.split("").map(Number);
};

const getDigitFrequencies = (numberArray) => {
    const counts = Array(9).fill(0);
    for (const num of numberArray) {
        if (num >= 0 && num < 9) {
            counts[num]++;
        }
    }
    return counts;
};

const precomputedCombinations = generateValidCombinations();

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const trimmedInput = rawInputData.trim();
const processedInputLines = trimmedInput.split("\n");

while (processedInputLines.length > 0) {
    const currentInputLine = processedInputLines.shift();
    const foundDigits = [];

    for (let candidateDigit = 0; candidateDigit < 9; candidateDigit++) {
        let modifiedDigitSequence = parseLineToNumbers(currentInputLine);

        modifiedDigitSequence = modifiedDigitSequence.map(originalValue => originalValue - 1);

        modifiedDigitSequence.push(candidateDigit);

        modifiedDigitSequence.sort((a, b) => a - b);

        const digitFrequencyCounts = getDigitFrequencies(modifiedDigitSequence);

        const highestFrequency = Math.max(...digitFrequencyCounts);

        if (highestFrequency >= 5) {
            continue;
        }

        if (precomputedCombinations.hasOwnProperty(modifiedDigitSequence.join(""))) {
            foundDigits.push(candidateDigit + 1);
        }
    }
    console.log((foundDigits.length === 0) ? "0" : foundDigits.join(" "));
}
