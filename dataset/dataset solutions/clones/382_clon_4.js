const fileSystem = require('fs');

const getNextAscending = (currentPoint) => currentPoint + 1;
const getNextDescending = (currentPoint) => currentPoint - 1;
const getNextCyclic = (currentPoint) => (currentPoint === 9 ? 5 : currentPoint + 1);

const buildPathSequence = (startPoint, endPoint, stepFunction) => {
    const sequenceSteps = [startPoint];
    let current = startPoint;
    while (current !== endPoint) {
        current = stepFunction(current);
        sequenceSteps.push(current);
    }
    return sequenceSteps;
};

const resolvePath = (startPoint, endPoint) => {
    if (startPoint === endPoint) {
        return [startPoint];
    } else if (startPoint < endPoint) {
        return buildPathSequence(startPoint, endPoint, getNextAscending);
    } else if (startPoint > endPoint && startPoint <= 5) {
        return buildPathSequence(startPoint, endPoint, getNextDescending);
    } else {
        return buildPathSequence(startPoint, endPoint, getNextCyclic);
    }
};

const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawContent.trim().split('\n');

const caseCount = Number(lineSegments.shift());

lineSegments.slice(0, caseCount).map(currentPair => {
    const [initialValue, targetValue] = currentPair.split(' ').map(Number);
    const pathResult = resolvePath(initialValue, targetValue);
    console.log(pathResult.join(' '));
});
