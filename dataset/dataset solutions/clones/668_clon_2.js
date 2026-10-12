const inputValues = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const showcaseAmount = inputValues[0];
const lunarEnergy = inputValues.slice(1, showcaseAmount + 1);

let bestWithoutPrevious = 0;
let bestUntilNow = 0;

for (let showcaseIndex = 0; showcaseIndex < showcaseAmount; showcaseIndex++) {
    const takeShowcase =
        bestWithoutPrevious + lunarEnergy[showcaseIndex];

    const leaveShowcase = bestUntilNow;

    const updatedMaximum =
        Math.max(takeShowcase, leaveShowcase);

    bestWithoutPrevious = bestUntilNow;
    bestUntilNow = updatedMaximum;
}

console.log(bestUntilNow);