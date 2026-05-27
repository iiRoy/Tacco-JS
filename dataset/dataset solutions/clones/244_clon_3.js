const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const numericInputSequence = rawInputContent.split(/\s/).map(Number);

const referenceSet = Array.from({ length: 10 }, (_, idx) => idx + 1);

function evaluateTriplet(valA, valB, valC, numbersToCheck) {
    let currentEligibleCount = 0;
    const sumOfFirstTwo = valA + valB;
    const upperLimit = 20 - sumOfFirstTwo;

    for (const numCandidate of numbersToCheck) {
        const meetsThreshold = numCandidate <= upperLimit;
        const isNotExcludedA = numCandidate !== valA;
        const isNotExcludedB = numCandidate !== valB;
        const isNotExcludedC = numCandidate !== valC;

        if (meetsThreshold && isNotExcludedA && isNotExcludedB && isNotExcludedC) {
            currentEligibleCount++;
        }
    }
    return currentEligibleCount >= 4;
}

for (let tripletStartIdx = 0; tripletStartIdx < numericInputSequence.length - 1; tripletStartIdx += 3) {
    const firstVal = numericInputSequence[tripletStartIdx];
    const secondVal = numericInputSequence[tripletStartIdx + 1];
    const thirdVal = numericInputSequence[tripletStartIdx + 2];

    const result = evaluateTriplet(firstVal, secondVal, thirdVal, referenceSet);

    if (result) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
