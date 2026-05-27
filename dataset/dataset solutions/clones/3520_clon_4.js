const parseNum = (s) => +s;
const parseCoordinates = (s) => s.split(' ').map(parseNum);

function mainLogic(rawInput) {
    const inputLines = rawInput.split('\n');
    const coordinateCount = parseNum(inputLines[0]);

    const initialCoordinatePairs = inputLines
        .slice(1, coordinateCount + 1)
        .map(parseCoordinates);

    const firstPointSumParity = (initialCoordinatePairs[0][0] + initialCoordinatePairs[0][1]) % 2;

    const allPointsValid = initialCoordinatePairs.every(pair => {
        return ((pair[0] + pair[1]) % 2) === firstPointSumParity;
    });

    if (!allPointsValid) {
        console.log(-1);
        return;
    }

    const adjustedCoordinatePairs = initialCoordinatePairs.map(pair => {
        if (firstPointSumParity === 1 && pair[0] % 2 !== 0) {
            return [pair[1], pair[0]];
        }
        return pair;
    });

    const baseArmLength = 20;
    const totalArmCount = baseArmLength + (adjustedCoordinatePairs[0][0] % 2) + (adjustedCoordinatePairs[0][1] % 2);

    console.log(totalArmCount);
    console.log(Array.from({ length: totalArmCount }, () => 1).join(' '));

    const movementPaths = adjustedCoordinatePairs.map(currentPair => {
        let [currentX, currentY] = currentPair;
        let pathPrefix = '';

        if (currentX % 2 !== 0) {
            pathPrefix += 'R';
            currentX++;
        }
        if (currentY % 2 !== 0) {
            pathPrefix += 'R';
            currentY++;
        }

        const fixedOffset = 10;
        const rightSteps = 'R'.repeat((fixedOffset + currentX) / 2);
        const leftSteps = 'L'.repeat((fixedOffset - currentX) / 2);
        const upSteps = 'U'.repeat((fixedOffset + currentY) / 2);
        const downSteps = 'D'.repeat((fixedOffset - currentY) / 2);

        return pathPrefix + rightSteps + leftSteps + upSteps + downSteps;
    });

    console.log(movementPaths.join('\n'));
}

mainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
