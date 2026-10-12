const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = fileContent.split('\n');

const initialCount = Number(lineSegments.shift());

const initialElements = lineSegments.shift().split(' ').map(Number);

const elementFrequencies = new Map();
let currentAggregate = 0;

for (const val of initialElements) {
    elementFrequencies.set(val, (elementFrequencies.get(val) || 0) + 1);
    currentAggregate += val;
}

const operationCount = Number(lineSegments.shift());

const queryStrings = lineSegments.filter(Boolean);

queryStrings.forEach(function(queryLine) {
    const [oldValueStr, newValueStr] = queryLine.split(' ');
    const targetValue = Number(oldValueStr);
    const replacementValue = Number(newValueStr);

    if (!elementFrequencies.has(targetValue)) {
        console.log(currentAggregate);
        return;
    }

    const countOfTarget = elementFrequencies.get(targetValue);

    currentAggregate += (replacementValue - targetValue) * countOfTarget;

    elementFrequencies.delete(targetValue);

    elementFrequencies.set(replacementValue, (elementFrequencies.get(replacementValue) || 0) + countOfTarget);

    console.log(currentAggregate);
});
