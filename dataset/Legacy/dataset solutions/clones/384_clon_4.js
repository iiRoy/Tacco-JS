const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.replace(/\n$/, '').split('\n');

const caseCount = Number(lineSegments.shift());

function* generateAscendingPath(initialPosition, finalPosition) {
    let currentPosition = initialPosition;
    yield currentPosition;
    while (currentPosition !== finalPosition) {
        currentPosition++;
        yield currentPosition;
    }
}

function* generateDescendingPath(initialPosition, finalPosition) {
    let currentPosition = initialPosition;
    yield currentPosition;
    while (currentPosition !== finalPosition) {
        currentPosition--;
        yield currentPosition;
    }
}

function* generateCyclicPath(initialPosition, finalPosition) {
    let currentPosition = initialPosition;
    yield currentPosition;
    while (currentPosition !== finalPosition) {
        currentPosition++;
        if (currentPosition === 10) {
            currentPosition = 5;
        }
        yield currentPosition;
    }
}

const processedOutputs = lineSegments.slice(0, caseCount).map(lineText => {
    const [startPoint, endPoint] = lineText.split(' ').map(Number);

    let pathIterator;
    if (startPoint === endPoint) {
        pathIterator = (function*() { yield startPoint; })();
    } else if (startPoint < endPoint) {
        pathIterator = generateAscendingPath(startPoint, endPoint);
    } else if (startPoint > endPoint && startPoint <= 5) {
        pathIterator = generateDescendingPath(startPoint, endPoint);
    } else {
        pathIterator = generateCyclicPath(startPoint, endPoint);
    }

    const sequenceElements = Array.from(pathIterator);
    return sequenceElements.join(' ');
});

processedOutputs.forEach(outputLine => console.log(outputLine));
