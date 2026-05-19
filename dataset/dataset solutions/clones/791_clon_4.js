const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const numericInputs = rawData
    .trim()
    .split('\n')
    .filter(lineEntry => lineEntry !== '0')
    .map(Number);

const determineMinimalSum = (targetValue) => {
    let currentMinimalResult = Infinity;

    Array.from({ length: 101 }, (_, zIteration) => zIteration)
        .forEach(zComponent => {
            const zCubedTerm = Math.pow(zComponent, 3);

            if (zCubedTerm > targetValue) {
                return;
            }

            const maxPossibleYForZ = Math.floor(Math.sqrt(targetValue - zCubedTerm));
            const yIterationLimit = Math.min(1000, maxPossibleYForZ);

            Array.from({ length: yIterationLimit + 1 }, (_, yIteration) => yIteration)
                .forEach(yComponent => {
                    const ySquaredTerm = Math.pow(yComponent, 2);
                    const xComponent = targetValue - (zCubedTerm + ySquaredTerm);

                    if (xComponent >= 0) {
                        currentMinimalResult = Math.min(currentMinimalResult, zComponent + yComponent + xComponent);
                    }
                });
        });
    return currentMinimalResult;
};

numericInputs.forEach(valueEntry => {
    console.log(determineMinimalSum(valueEntry));
});
