function PatternGenerator() {
    const validPatternsMap = {};
    const segmentSetA = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");
    const segmentSetB = "11,22,33,44,55,66,77,88,99".split(",");

    const normalizeAndSortDigits = (inputDigitString) => {
        return inputDigitString.split("").map(Number).sort((a, b) => a - b).join("");
    };

    for (let idxA_1 = 0; idxA_1 < 16; idxA_1++) {
        for (let idxA_2 = 0; idxA_2 < 16; idxA_2++) {
            for (let idxA_3 = 0; idxA_3 < 16; idxA_3++) {
                for (let idxA_4 = 0; idxA_4 < 16; idxA_4++) {
                    for (let idxB_val = 0; idxB_val < 9; idxB_val++) {
                        const concatenatedSegments = segmentSetA[idxA_1] + segmentSetA[idxA_2] + segmentSetA[idxA_3] + segmentSetA[idxA_4] + segmentSetB[idxB_val];
                        const processedPattern = normalizeAndSortDigits(concatenatedSegments);
                        validPatternsMap[processedPattern] = true;
                    }
                }
            }
        }
    }
    return validPatternsMap;
}

const precomputedPatterns = PatternGenerator();

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputQueryLines = rawInputData.trim().split("\n");

const prepareSortedDigitArray = (baseString, digitToAppend) => {
    const tempArr = baseString.split("").map(Number);
    tempArr.push(digitToAppend);
    tempArr.sort((a, b) => a - b);
    return tempArr;
};

const hasHighFrequencyDigit = (digitCollection) => {
    const frequencyCounts = new Array(10).fill(0);
    for (const digit of digitCollection) {
        frequencyCounts[digit]++;
    }
    for (let i = 0; i < frequencyCounts.length; i++) {
        if (frequencyCounts[i] >= 5) {
            return true;
        }
    }
    return false;
};

while (inputQueryLines.length > 0) {
    const currentQueryString = inputQueryLines.shift();
    const matchingDigits = [];

    for (let candidateDigit = 1; candidateDigit <= 9; candidateDigit++) {
        const currentDigitArray = prepareSortedDigitArray(currentQueryString, candidateDigit);

        if (hasHighFrequencyDigit(currentDigitArray)) {
            continue;
        }

        const sortedPatternKey = currentDigitArray.join("");
        if (precomputedPatterns.hasOwnProperty(sortedPatternKey)) {
            matchingDigits.push(candidateDigit);
        }
    }

    if (matchingDigits.length === 0) {
        console.log("0");
    } else {
        console.log(matchingDigits.join(" "));
    }
}
