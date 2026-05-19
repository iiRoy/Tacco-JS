function obtainCanonicalKey(rawSequence) {
    const digitTallies = new Array(10).fill(0);
    for (let charUnit of rawSequence) {
        digitTallies[Number(charUnit)]++;
    }
    let orderedRepresentation = '';
    for (let digitValue = 0; digitValue < 10; digitValue++) {
        orderedRepresentation += String(digitValue).repeat(digitTallies[digitValue]);
    }
    return orderedRepresentation;
}

function deriveCanonicalKeyFromTallies(tallyArray) {
    let orderedRepresentation = '';
    for (let digitValue = 0; digitValue < 10; digitValue++) {
        orderedRepresentation += String(digitValue).repeat(tallyArray[digitValue]);
    }
    return orderedRepresentation;
}

function determineHighestTally(tallyArray) {
    let peakCount = 0;
    for (let i = 0; i < 10; i++) {
        if (tallyArray[i] > peakCount) {
            peakCount = tallyArray[i];
        }
    }
    return peakCount;
}

function buildReferenceCollection() {
    const referenceRegistry = {};
    const primarySet = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");
    const secondarySet = "11,22,33,44,55,66,77,88,99".split(",");

    function* generateComponentSequences(currentSequence = [], currentDepth = 0) {
        if (currentDepth === 4) {
            for (const secondaryElement of secondarySet) {
                yield [...currentSequence, secondaryElement];
            }
            return;
        }

        for (const primaryElement of primarySet) {
            yield* generateComponentSequences([...currentSequence, primaryElement], currentDepth + 1);
        }
    }

    for (const sequenceCombination of generateComponentSequences()) {
        const concatenatedString = sequenceCombination.join('');
        const canonicalKey = obtainCanonicalKey(concatenatedString);
        referenceRegistry[canonicalKey] = true;
    }

    return referenceRegistry;
}

const lookupTable = buildReferenceCollection();
const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

inputDataLines.forEach(currentInputString => {
    const baseDigitTallies = new Array(10).fill(0);
    for (let char of currentInputString) {
        baseDigitTallies[Number(char)]++;
    }

    const qualifyingAppends = [];

    for (let potentialDigit = 1; potentialDigit <= 9; potentialDigit++) {
        const trialTallies = [...baseDigitTallies];
        trialTallies[potentialDigit]++;

        if (determineHighestTally(trialTallies) >= 5) {
            continue;
        }

        const trialKey = deriveCanonicalKeyFromTallies(trialTallies);
        if (lookupTable.hasOwnProperty(trialKey)) {
            qualifyingAppends.push(potentialDigit);
        }
    }

    console.log(qualifyingAppends.length === 0 ? "0" : qualifyingAppends.join(" "));
});
