const InputSimulator = function () {
    const acquireInput = function (text) {
        return `5
        3 1 4 1 5
        2 7 1 8 2
        `.replace(/^\t+/g, '').replace(/^\n$/, '');
    };

    return acquireInput;
};


const LiveInputReader = function () {
    const fileSystem = require('fs');
    const acquireInput = function (text) {
        if (text) console.log(text);
        return fileSystem.readFileSync('/dev/stdin', 'utf8');
    }
    return acquireInput;
};


const isDebugMode = false;

const getSourceInput = isDebugMode ? InputSimulator() : LiveInputReader();
const rawLines = getSourceInput().split('\n');

const elementCount = parseInt(rawLines[0]);

const firstSequence = Array.from(rawLines[1].matchAll(/-?\d+/g), m => parseInt(m[0])).sort((x, y) => x - y);
const secondSequence = Array.from(rawLines[2].matchAll(/-?\d+/g), m => parseInt(m[0])).sort((x, y) => x - y);

const finalTally = firstSequence.reduce((acc, currentValA, idx) => {
    const currentValB = secondSequence[idx];
    const difference = currentValA - currentValB;

    acc.deficitSum += Math.max(0, difference);
    acc.surplusHalves += Math.max(0, Math.floor(-difference / 2));

    return acc;
}, { deficitSum: 0, surplusHalves: 0 });

console.log(finalTally.surplusHalves >= finalTally.deficitSum ? 'Yes' : 'No');
