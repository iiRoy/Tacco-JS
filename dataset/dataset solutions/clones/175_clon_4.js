const makeTripletsSequential = Array.from({length: 7}, (_, idx) => [idx, idx + 1, idx + 2]);
const makeTripletsRepeating = Array.from({length: 9}, (_, idx) => [idx, idx, idx]);
const makeDoublesRepeating = Array.from({length: 9}, (_, idx) => [idx, idx]);

const allThreeDigitSources = makeTripletsSequential.concat(makeTripletsRepeating);

function PatternRegistry() {
    const digitCombinations = allThreeDigitSources.flatMap(segmentA =>
        allThreeDigitSources.flatMap(segmentB =>
            allThreeDigitSources.flatMap(segmentC =>
                allThreeDigitSources.flatMap(segmentD =>
                    makeDoublesRepeating.map(segmentE =>
                        [...segmentA, ...segmentB, ...segmentC, ...segmentD, ...segmentE]
                    )
                )
            )
        )
    );

    const recognizedFingerprints = new Set(
        digitCombinations.map(sequence =>
            sequence.sort((valA, valB) => valA - valB).join("")
        )
    );
    return recognizedFingerprints;
}

const theRegistry = PatternRegistry();

const evaluateInputLine = (currentLine) => {
    const initialDigits = currentLine.split("").map(Number).map(v => v - 1);

    const possibleInsertValues = Array.from({ length: 9 }, (_, k) => k);

    const validOutcomes = possibleInsertValues.filter(insertCandidate => {
        const testSequence = [...initialDigits, insertCandidate];

        const digitOccurrences = testSequence.reduce((acc, digit) => {
            acc[digit] = (acc[digit] || 0) + 1;
            return acc;
        }, {});

        const highestCount = Math.max(...Object.values(digitOccurrences));
        if (highestCount >= 5) {
            return false;
        }

        const sortedIdentifier = testSequence.sort((valA, valB) => valA - valB).join("");
        return theRegistry.has(sortedIdentifier);
    });

    return validOutcomes.length === 0 ? "0" : validOutcomes.map(val => val + 1).join(" ");
};

const rawInputContent = require('node:fs').readFileSync(0, 'utf8');
const inputDataLines = rawInputContent.trim().split('\n').filter(line => line.length > 0);

inputDataLines.forEach(line => {
    console.log(evaluateInputLine(line));
});