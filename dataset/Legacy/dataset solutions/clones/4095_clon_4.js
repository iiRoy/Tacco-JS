const parseProblemData = (rawData) => {
    const dataLines = rawData.trim().split('\n');
    const firstLineParts = dataLines[0].split(' ');
    const countVal = parseInt(firstLineParts[0], 10);
    const sequenceArr = dataLines[1].split(' ').map(Number);
    return { count: countVal, sequence: sequenceArr };
};

const calculateRange = (count, sequence) => {
    const initialBounds = [2, 2];

    const reverseIndices = Array.from({ length: count - 1 }, (_, index) => count - 2 - index);

    const finalBounds = reverseIndices.reduce((currentBounds, currentIdx) => {
        if (currentBounds[0] === -1) {
            return currentBounds;
        }

        const [lowerBound, upperBound] = currentBounds;
        const currentDivisor = sequence[currentIdx];
        const nextDivisor = sequence[currentIdx + 1];

        if (upperBound + nextDivisor - 1 < currentDivisor) {
            return [-1, -1];
        }

        const newLowerBound = Math.ceil(lowerBound / currentDivisor) * currentDivisor;

        let newUpperBound = Math.ceil(upperBound / nextDivisor) * nextDivisor + nextDivisor - 1;
        newUpperBound = Math.floor(newUpperBound / currentDivisor) * currentDivisor;

        return [newLowerBound, newUpperBound];
    }, initialBounds);

    if (finalBounds[0] === -1) {
        return '-1';
    } else {
        return `${finalBounds[0]} ${finalBounds[1] + sequence[0] - 1}`;
    }
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const { count, sequence } = parseProblemData(rawInputContent);
const result = calculateRange(count, sequence);
console.log(result);
