const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedRecords = dataStream.trim().split('\n');

const MAX_NUMERIC_BOUND = 100001;

const rangeSpecificationCount = Number(processedRecords[0]);
const boundarySet = processedRecords.slice(1, rangeSpecificationCount + 1).map(recordLine => {
    const boundaryPoints = recordLine.split(' ').map(Number);
    return { initial: boundaryPoints[0], final: boundaryPoints[1] };
});

const changeRegister = new Array(MAX_NUMERIC_BOUND + 2).fill(0);

boundarySet.forEach(span => {
    changeRegister[span.initial]++;
    changeRegister[span.final + 1]--;
});

let currentAggregateInfluence = 0;
const computedMetrics = Array.from({ length: MAX_NUMERIC_BOUND + 1 }, (_, index) => {
    currentAggregateInfluence += changeRegister[index];
    // Original 'arr[i]' was initialized to 1, then incremented by coverage.
    // So, it's 1 + (number of ranges covering index).
    return 1 + currentAggregateInfluence;
});

let finalCriterionMatch = 1;
// Generate indices from MAX_NUMERIC_BOUND down to 2
Array.from({ length: MAX_NUMERIC_BOUND - 1 }, (_, i) => MAX_NUMERIC_BOUND - i)
    .some(idx => {
        if (idx < 2) return false; // Ensure we only check indices from 2 upwards
        if (computedMetrics[idx] >= idx) {
            finalCriterionMatch = idx;
            return true; // Found the largest satisfying index, stop iteration
        }
        return false;
    });

console.log(finalCriterionMatch - 1);