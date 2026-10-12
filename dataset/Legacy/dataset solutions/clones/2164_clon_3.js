function processInputAndCalculate(rawData) {
    const parseInputData = (rawText) => {
        const lines = rawText.trim().split("\n").map(line => line.split(" "));
        const numberString = lines[0][0];
        const digitArray = numberString.split('').map(char => parseInt(char, 10));
        return { numberString, digitArray };
    };

    const { numberString, digitArray } = parseInputData(rawData);
    const digitCount = numberString.length;
    const carryUpFlags = Array.from({ length: digitCount }, () => false);

    const markSegmentForCarry = (startIndex, endIndex, flagsArray) => {
        for (let k = startIndex; k <= endIndex; k++) {
            flagsArray[k] = true;
        }
    };

    for (let currentIdx = 0; currentIdx < digitCount; currentIdx++) {
        const currentDigitValue = digitArray[currentIdx];

        if (currentDigitValue === 5) {
            let patternLength = 1;

            while (true) {
                const checkIndex = currentIdx + patternLength;
                if (checkIndex >= digitCount) {
                    break;
                }

                const expectedDigitInPattern = (patternLength % 2 === 1) ? 4 : 5;

                if (digitArray[checkIndex] === expectedDigitInPattern) {
                    patternLength++;
                } else {
                    break;
                }
            }

            const digitAfterPatternIndex = currentIdx + patternLength;
            const digitAfterPatternValue = digitArray[digitAfterPatternIndex];

            const shouldSkipMarking = (digitAfterPatternIndex >= digitCount || digitAfterPatternValue <= 4);

            if (!shouldSkipMarking) {
                markSegmentForCarry(currentIdx, digitAfterPatternIndex - 1, carryUpFlags);
            }

            currentIdx += (patternLength - 1);
        }
    }

    let totalSum = 0;
    let hasPreviousCarry = false;

    const getNextDigitSafe = (idx, arr) => arr[idx + 1];

    for (let currentIdx = 0; currentIdx < digitCount; currentIdx++) {
        const currentDigitValue = digitArray[currentIdx];
        const nextDigitValue = getNextDigitSafe(currentIdx, digitArray);

        const valueForCarryUp = 11 - currentDigitValue;

        if (currentDigitValue >= 6) {
            if (hasPreviousCarry) {
                totalSum -= 2;
            }
            carryUpFlags[currentIdx] = hasPreviousCarry = true;
            totalSum += valueForCarryUp;
        } else if (currentDigitValue <= 3) {
            hasPreviousCarry = false;
            totalSum += currentDigitValue;
        } else if (currentDigitValue === 5) {
            if (hasPreviousCarry) {
                totalSum -= 2;
                carryUpFlags[currentIdx] = true;
                totalSum += valueForCarryUp;
            } else {
                if (nextDigitValue >= 5) {
                    carryUpFlags[currentIdx] = hasPreviousCarry = true;
                    totalSum += valueForCarryUp;
                } else if (nextDigitValue <= 3) {
                    totalSum += currentDigitValue;
                } else if (carryUpFlags[currentIdx]) {
                    hasPreviousCarry = true;
                    totalSum += valueForCarryUp;
                } else {
                    totalSum += currentDigitValue;
                }
            }
        } else {
            if (hasPreviousCarry) {
                if (nextDigitValue >= 5) {
                    totalSum -= 2;
                    carryUpFlags[currentIdx] = true;
                    totalSum += valueForCarryUp;
                } else {
                    hasPreviousCarry = false;
                    totalSum += currentDigitValue;
                }
            } else {
                totalSum += currentDigitValue;
            }
        }
    }

    console.log(totalSum);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
