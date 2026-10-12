const findPathCost = (startX, startY) => {
    const moveOffsets = [
        { deltaX: 0, deltaY: -1 },
        { deltaX: -1, deltaY: 0 },
        { deltaX: 1, deltaY: 0 },
        { deltaX: 0, deltaY: 1 }
    ];

    let totalSteps = 0;
    const explorationQueue = [{ xCoord: startX, yCoord: startY, pathLength: 0, currentPowerLevel: 1 }];

    const maxPowerReached = new Map();
    maxPowerReached.set(`${startX},${startY}`, 1);

    while (explorationQueue.length > 0) {
        const { xCoord, yCoord, pathLength, currentPowerLevel } = explorationQueue.shift();

        if (currentPowerLevel === power + 1) {
            totalSteps = pathLength;
            return totalSteps;
        }

        moveOffsets.forEach(offset => {
            const nextX = xCoord + offset.deltaX;
            const nextY = yCoord + offset.deltaY;
            let nextPower = currentPowerLevel;

            if (nextX < 0 || nextY < 0 || nextX >= hw[1] || nextY >= hw[0]) {
                return;
            }
            if (YX[nextY][nextX] === "X") {
                return;
            }

            if (YX[nextY][nextX] === String(nextPower)) {
                nextPower++;
            }

            const coordinateKey = `${nextX},${nextY}`;
            const existingMaxPower = maxPowerReached.get(coordinateKey) || 0;

            if (existingMaxPower >= nextPower) {
                return;
            }

            maxPowerReached.set(coordinateKey, nextPower);
            explorationQueue.push({ xCoord: nextX, yCoord: nextY, pathLength: pathLength + 1, currentPowerLevel: nextPower });
        });
    }

    return totalSteps;
};

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = (input.trim()).split("\n");
var hw = (Arr.shift()).split(" ").map(Number);
var power = hw[2];
var YX = [];
var start = [];
for (var i = 0; i < hw[0]; i++) {
    var arr = (Arr.shift()).split("");
    if (arr.indexOf("S") != -1) start = [arr.indexOf("S"), i];
    YX.push(arr);
}
var ans = findPathCost(start[0], start[1]);
console.log(ans);
