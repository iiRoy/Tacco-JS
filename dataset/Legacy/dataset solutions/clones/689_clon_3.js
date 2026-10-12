var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

const getCube = (num) => {
    return num * num * num;
};

while (true) {
    const currentValue = parseInt(lines.shift(), 10);

    if (currentValue === 0) {
        break;
    }

    const cubeOfCurrent = getCube(currentValue);

    const positiveDifferences = [];

    for (let outerLoopVar = currentValue - 1; outerLoopVar > 0; outerLoopVar--) {
        const cubeI = getCube(outerLoopVar);

        for (let innerLoopVar = outerLoopVar; innerLoopVar > 0; innerLoopVar--) {
            const cubeJ = getCube(innerLoopVar);
            const calculatedDifference = cubeOfCurrent - cubeI - cubeJ;

            if (calculatedDifference > 0) {
                positiveDifferences.push(calculatedDifference);
            }
        }
    }

    positiveDifferences.sort((valA, valB) => valA - valB);

    console.log(positiveDifferences[0]);
}
