const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileContent.split(/\r?\n/).filter(Boolean);

const rangeCount = parseInt(dataLines.shift(), 10);

const MAX_POSSIBLE_VALUE = 100001;
let coverageTracker = Array.from({ length: MAX_POSSIBLE_VALUE + 1 }, () => 1);

dataLines.slice(0, rangeCount).forEach(lineEntry => {
    const [startPoint, endPoint] = lineEntry.split(' ').map(Number);
    let currentPoint = startPoint;
    while (currentPoint <= endPoint) {
        coverageTracker[currentPoint]++;
        currentPoint++;
    }
});

const ultimateResult = Array.from({ length: MAX_POSSIBLE_VALUE - 1 }, (_, index) => index + 2)
    .reduce((currentMaximum, valueCandidate) => {
        if (coverageTracker[valueCandidate] >= valueCandidate) {
            return valueCandidate;
        }
        return currentMaximum;
    }, 1);

console.log(ultimateResult - 1);
