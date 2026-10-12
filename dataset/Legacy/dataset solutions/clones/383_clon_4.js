const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

const obtainNextComplexStep = (currentValue, currentDirection) => {
    if (currentDirection === 1) {
        if (currentValue === 9) {
            return { nextValue: 5, nextDirection: -1 };
        }
        return { nextValue: currentValue + 1, nextDirection: 1 };
    } else {
        if (currentValue === 0) {
            return { nextValue: 1, nextDirection: 1 };
        }
        return { nextValue: currentValue - 1, nextDirection: -1 };
    }
};

const pathStrategies = {
    forwardPath: function* (initialPoint, finalDestination) {
        let currentPoint = initialPoint;
        while (currentPoint !== finalDestination) {
            currentPoint++;
            yield currentPoint;
        }
    },
    backwardSmallPath: function* (initialPoint, finalDestination) {
        let currentPoint = initialPoint;
        while (currentPoint !== finalDestination) {
            currentPoint--;
            yield currentPoint;
        }
    },
    complexPath: function* (initialPoint, finalDestination) {
        let currentPoint = initialPoint;
        let currentPathDirection = 1;
        while (currentPoint !== finalDestination) {
            const { nextValue, nextDirection } = obtainNextComplexStep(currentPoint, currentPathDirection);
            currentPoint = nextValue;
            currentPathDirection = nextDirection;
            yield currentPoint;
        }
    },
    noOpPath: function* () {}
};

const selectPathStrategy = (initialPoint, finalDestination) => {
    if (initialPoint === finalDestination) {
        return pathStrategies.noOpPath;
    }
    if (initialPoint < finalDestination) {
        return pathStrategies.forwardPath;
    }
    if (initialPoint > finalDestination && initialPoint <= 5) {
        return pathStrategies.backwardSmallPath;
    }
    if (initialPoint > finalDestination && initialPoint >= 6) {
        return pathStrategies.complexPath;
    }
    return pathStrategies.noOpPath;
};

const rawInputData = fileSystem.readFileSync(standardInputPath, 'utf8');
const processedLines = rawInputData.trimEnd().split('\n');

const testCaseCount = Number(processedLines.shift());

const outputLines = processedLines.slice(0, testCaseCount).map(lineContent => {
    const [startValue, goalValue] = lineContent.split(' ').map(Number);

    const pathSegments = [startValue];

    const strategyGenerator = selectPathStrategy(startValue, goalValue);
    for (const step of strategyGenerator(startValue, goalValue)) {
        pathSegments.push(step);
    }

    return pathSegments.join(' ');
});

outputLines.forEach(line => console.log(line));
