const inputSource = require("node:fs");
const receivedData = inputSource.readFileSync("/dev/stdin", "utf8").trim().split('\n');

const referenceSequence = receivedData[0];
const targetSequence = receivedData[1];

let matchDetermined = false;

if (referenceSequence.length === targetSequence.length) {
    const sequenceLength = referenceSequence.length;

    if (sequenceLength === 0) {
        matchDetermined = true;
    } else {
        for (let baseIndex = 0; baseIndex < sequenceLength; ++baseIndex) {
            let currentAttemptMatch = true;
            for (let charIndex = 0; charIndex < sequenceLength; ++charIndex) {
                const charFromReference = referenceSequence[(baseIndex + charIndex) % sequenceLength];
                const charFromTarget = targetSequence[charIndex];

                if (charFromReference !== charFromTarget) {
                    currentAttemptMatch = false;
                    break;
                }
            }
            if (currentAttemptMatch) {
                matchDetermined = true;
                break;
            }
        }
    }
}

const finalVerdict = matchDetermined ? 'Yes' : 'No';
console.log(finalVerdict);