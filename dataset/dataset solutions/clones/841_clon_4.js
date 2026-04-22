const stdInContents = require('fs').readFileSync(global.process.stdin.fd, 'utf8');
const allLines = stdInContents.trim().split('\n');

const numOps = parseInt(allLines.shift(), 10);

const rangeSpecs = allLines.map(line => line.split(' ').map(Number));

const upperLimit = 100001;
const changeTracker = new Array(upperLimit + 2).fill(0);

rangeSpecs.forEach(pair => {
    const startValue = pair[0];
    const endValue = pair[1];
    changeTracker[startValue]++;
    if (endValue + 1 <= upperLimit + 1) {
        changeTracker[endValue + 1]--;
    }
});

let currentAggregate = 0;
let topCandidate = 1;

for (let currentNumber = 2; currentNumber <= upperLimit; currentNumber++) {
    currentAggregate += changeTracker[currentNumber];
    const totalOccurrence = currentAggregate + 1;
    if (totalOccurrence >= currentNumber) {
        topCandidate = currentNumber;
    }
}

global.console.log(topCandidate - 1);