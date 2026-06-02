const fileSystem = require('fs');

const determinePath = (startPoint, endPoint) => {
    const progression = [startPoint];
    let currentPoint = startPoint;

    const stepFunctions = {
        incrementSimple: (val) => val + 1,
        decrementSimple: (val) => val - 1,
        incrementWrap: (val) => (val + 1 === 10) ? 5 : val + 1,
        incrementThenDecrement: (val, state) => {
            if (!state.direction) state.direction = 1;
            let next = val + state.direction;
            if (next === 10) {
                next = 5;
                state.direction = -1;
            }
            return next;
        }
    };

    const strategyDefinitions = [
        {
            condition: (s, g) => s < g,
            logic: stepFunctions.incrementSimple
        },
        {
            condition: (s, g) => s > g && s <= 5,
            logic: stepFunctions.decrementSimple
        },
        {
            condition: (s, g) => s > g && s >= 6 && g >= 6,
            logic: stepFunctions.incrementWrap
        },
        {
            condition: (s, g) => s > g && s >= 6 && g <= 5,
            logic: stepFunctions.incrementThenDecrement
        }
    ];

    let activeLogic = null;
    let logicState = {};

    for (const definition of strategyDefinitions) {
        if (definition.condition(startPoint, endPoint)) {
            activeLogic = definition.logic;
            break;
        }
    }

    if (!activeLogic) {
        return progression;
    }

    while (currentPoint !== endPoint) {
        currentPoint = activeLogic(currentPoint, logicState);
        progression.push(currentPoint);
    }

    return progression;
};

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInput.trim().split('\n');
const totalCases = Number(dataLines.shift());

dataLines.slice(0, totalCases).forEach(lineEntry => {
    const [startValue, goalValue] = lineEntry.split(' ').map(Number);
    const computedPath = determinePath(startValue, goalValue);
    console.log(computedPath.join(' '));
});
