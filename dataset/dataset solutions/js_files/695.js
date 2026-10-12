const data = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const observationCount = data[0];
const windows = [];

for (let i = 0; i < observationCount; i++) {
    const start = data[1 + i * 2];
    const end = data[2 + i * 2];

    windows.push({ start, end });
}

windows.sort((first, second) =>
    first.end - second.end || first.start - second.start
);

let observedComets = 0;
let telescopeAvailableAt = -Infinity;

for (const window of windows) {
    if (window.start >= telescopeAvailableAt) {
        observedComets++;
        telescopeAvailableAt = window.end;
    }
}

console.log(observedComets);