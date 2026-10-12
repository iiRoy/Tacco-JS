var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataParts = rawData.trim().split(" ");
const rateA = Number(dataParts[0]);
const offsetB = Number(dataParts[1]);
let currentValueC = Number(dataParts[2]);

const CYCLE_INCREMENT_VALUE = 7;

let currentDuration = Math.ceil(currentValueC / rateA);

let totalAccumulation = 0;

const effectiveReductionPerCycle = offsetB + (CYCLE_INCREMENT_VALUE * rateA);

while (currentDuration > 6) {
    totalAccumulation += CYCLE_INCREMENT_VALUE;
    currentValueC -= effectiveReductionPerCycle;
    currentDuration = Math.ceil(currentValueC / rateA);
}

const finalDurationComponent = Math.max(0, currentDuration);
console.log(totalAccumulation + finalDurationComponent);
