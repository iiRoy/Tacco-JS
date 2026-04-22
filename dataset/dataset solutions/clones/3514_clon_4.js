const dataStream = process.stdin.readFileSync(0, 'utf8');

const parsedSegments = dataStream.split('\n');
const totalItems = Number(parsedSegments[0].trim());
const numericalValues = parsedSegments[1].trim().split(' ').map(Number);

const patternAnalyzer = (sequence, idxPredicate) => {
    const valueCounts = new Map();
    sequence.forEach((val, idx) => {
        if (idxPredicate(idx)) {
            valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
        }
    });

    let sortedCounts = Array.from(valueCounts.entries())
        .map(([val, cnt]) => ({ value: val, count: cnt }))
        .sort((a, b) => b.count - a.count);

    if (sortedCounts.length === 0) {
        sortedCounts.push({ value: -1, count: 0 });
    }
    if (sortedCounts.length === 1) {
        sortedCounts.push({ value: -2, count: 0 });
    }
    return sortedCounts;
};

const evenFrequencies = patternAnalyzer(numericalValues, (idx) => idx % 2 === 0);
const oddFrequencies = patternAnalyzer(numericalValues, (idx) => idx % 2 !== 0);

const firstEven = evenFrequencies[0];
const secondEven = evenFrequencies[1];
const firstOdd = oddFrequencies[0];
const secondOdd = oddFrequencies[1];

const allPossibleCandidatePairs = [
    [firstEven, firstOdd],
    [firstEven, secondOdd],
    [secondEven, firstOdd],
    [secondEven, secondOdd]
];

const validPairSums = allPossibleCandidatePairs.reduce((accumulator, [evenCandidate, oddCandidate]) => {
    if (evenCandidate.value !== oddCandidate.value) {
        accumulator.push(evenCandidate.count + oddCandidate.count);
    }
    return accumulator;
}, []);

const optimalMatchSum = validPairSums.length > 0 ? Math.max(...validPairSums) : 0;

const resultantTransformation = totalItems - optimalMatchSum;

console.log(resultantTransformation);