const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.trim().split('\n');

const checkArithmeticProgression = (sequence) => {
    if (sequence.length < 2) {
        return true;
    }
    const commonDifference = sequence[1] - sequence[0];
    return sequence.slice(2).every((currentValue, idx) => {
        const previousValue = sequence[idx + 1];
        return currentValue - previousValue === commonDifference;
    });
};

while (true) {
    const currentElementCount = Number(lineSegments.shift());
    if (currentElementCount === 0) {
        break;
    }

    const numberSequence = lineSegments.shift().split(' ').map(Number);

    const outlierPosition = Array.from({ length: currentElementCount + 1 }).findIndex((_, removalCandidateIdx) => {
        const filteredSequence = numberSequence.filter((_, originalItemIdx) => originalItemIdx !== removalCandidateIdx);
        return checkArithmeticProgression(filteredSequence);
    });

    console.log(numberSequence[outlierPosition]);
}
