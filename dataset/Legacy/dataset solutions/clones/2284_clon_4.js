"use strict";

function processInput(inputLines) {
    const targetDigitCount = parseInt(inputLines[0]);
    let lowerMarker = parseInt(inputLines[1].trim().split(" ").join(""));
    let upperMarker = parseInt(inputLines[2].trim().split(" ").join(""));

    if (lowerMarker === upperMarker) {
        console.log(0);
        return;
    }

    if (upperMarker < lowerMarker) {
        [lowerMarker, upperMarker] = [upperMarker, lowerMarker];
    }

    const iterationStartValues = [12, 123, 1234, 12345, 123456, 1234567, 12345678];
    const iterationStart = iterationStartValues[targetDigitCount - 2];
    const iterationEnd = 87654321;

    const isPermutationLike = (numValue, requiredLength) => {
        const numText = String(numValue);
        if (numText.length !== requiredLength) {
            return false;
        }
        if (numText.includes('0')) {
            return false;
        }

        const digitPresence = new Uint8Array(requiredLength + 1).fill(0);
        for (let k = 0; k < numText.length; k++) {
            const currentDigit = parseInt(numText[k]);
            if (currentDigit > requiredLength || digitPresence[currentDigit] > 0) {
                return false;
            }
            digitPresence[currentDigit]++;
        }
        return true;
    };

    function* generateCountableNumbers(startPoint, endPoint, requiredLen, activationMarker, terminationMarker) {
        let countingActive = false;
        for (let currentVal = startPoint; currentVal <= endPoint; currentVal++) {
            if (currentVal === activationMarker) {
                countingActive = true;
            }
            if (currentVal === terminationMarker) {
                break;
            }
            if (countingActive && isPermutationLike(currentVal, requiredLen)) {
                yield currentVal;
            }
        }
    }

    let finalResult = 0;
    for (const validNum of generateCountableNumbers(iterationStart, iterationEnd, targetDigitCount, lowerMarker, upperMarker)) {
        finalResult++;
    }
    console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
