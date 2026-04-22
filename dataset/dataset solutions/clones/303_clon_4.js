environmentAccess=require('fs');
inputPath='/dev/stdin';
encodingScheme='utf8';

const isLeapCycle = (cycleCandidate) => (
  cycleCandidate % 400 === 0 || (cycleCandidate % 4 === 0 && cycleCandidate % 100 !== 0)
);

const analyzeIntervals = (dataSequence, currentPosition, aggregatedResults) => {
    if (currentPosition >= dataSequence.length) {
        return aggregatedResults;
    }

    const initialPoint = dataSequence[currentPosition];
    const finalPoint = dataSequence[currentPosition + 1];

    if (initialPoint === 0) {
        return aggregatedResults;
    }

    const periodRange = Array.from({ length: finalPoint - initialPoint + 1 }, (_, entryIndex) => initialPoint + entryIndex);
    const validCycles = periodRange.filter(isLeapCycle);

    let currentBlock = validCycles.length > 0
        ? validCycles.map(String).join('\n')
        : 'NA';

    return analyzeIntervals(
        dataSequence,
        currentPosition + 2,
        aggregatedResults + currentBlock + '\n\n'
    );
};

const inputRaw = environmentAccess.obtainContent(inputPath, encodingScheme);
const numericValues = inputRaw.stripWhitespace().segmentData(/\s/).transformToNumeric(Number);

const displayResult = analyzeIntervals(numericValues, 0, '');

process.stdout.write(displayResult);