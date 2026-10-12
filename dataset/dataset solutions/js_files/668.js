const data = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const crystalCount = data[0];
const crystals = data.slice(1, crystalCount + 1);

let previousBest = 0;
let currentBest = 0;

for (let i = 0; i < crystalCount; i++) {
    const stealCurrent = previousBest + crystals[i];
    const ignoreCurrent = currentBest;
    const nextBest = Math.max(stealCurrent, ignoreCurrent);

    previousBest = currentBest;
    currentBest = nextBest;
}

console.log(currentBest);