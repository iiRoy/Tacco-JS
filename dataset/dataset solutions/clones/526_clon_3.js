const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineData = rawData.trim().split("\n");

const [totalLength, numStops, currentPos] = lineData.shift().split(" ").map(Number);

let stopLocations = [];

for (let idx = 0; idx < numStops; idx++) {
    const stopVal = Number(lineData.shift());
    if (stopVal !== currentPos) {
        stopLocations.push(stopVal);
    }
}

stopLocations.push(currentPos);

stopLocations.sort((a, b) => a - b);

let minimumValue = Infinity;

const lastStopIndex = stopLocations.length - 1;

for (let idx = 0; idx <= lastStopIndex; idx++) {
    const currentStop = stopLocations[idx];

    if (currentStop < currentPos) {
        if (idx > 0) {
            const previousStopValue = stopLocations[idx - 1];
            const calculationOne = (currentPos - currentStop) * 2 + (totalLength - currentPos + 1) + previousStopValue;
            minimumValue = Math.min(minimumValue, calculationOne);
        }
    } else if (currentStop === currentPos) {
        if (idx === 0) {
            minimumValue = Math.min(minimumValue, stopLocations[lastStopIndex] - currentStop);
        }
        if (idx === lastStopIndex) {
            minimumValue = Math.min(minimumValue, currentStop - stopLocations[0]);
        }
        if (idx !== lastStopIndex) {
            const nextStopValue = stopLocations[idx + 1];
            const calculationTwo = currentPos + totalLength - nextStopValue + 1;
            minimumValue = Math.min(minimumValue, calculationTwo);
        }
        if (idx !== 0) {
            const previousStopValue = stopLocations[idx - 1];
            const calculationThree = totalLength - currentPos + 1 + previousStopValue;
            minimumValue = Math.min(minimumValue, calculationThree);
        }
    } else { // currentStop > currentPos
        if (idx !== lastStopIndex) {
            const nextStopValue = stopLocations[idx + 1];
            const calculationFour = (currentStop - currentPos) * 2 + currentPos + (totalLength - nextStopValue + 1);
            minimumValue = Math.min(minimumValue, calculationFour);
        }
    }
}

console.log(minimumValue * 100);
