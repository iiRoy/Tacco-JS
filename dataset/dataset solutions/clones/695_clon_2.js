const telemetry = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const apparitionTotal = telemetry[0];
const celestialEvents = [];

for (let scanIndex = 0; scanIndex < apparitionTotal; scanIndex++) {
    const emergence = telemetry[1 + scanIndex * 2];
    const disappearance = telemetry[2 + scanIndex * 2];

    celestialEvents.push({ emergence, disappearance });
}

celestialEvents.sort((candidate, alternative) =>
    candidate.disappearance - alternative.disappearance ||
    candidate.emergence - alternative.emergence
);

let successfulCaptures = 0;
let instrumentReleasedAt = -Infinity;

for (const apparition of celestialEvents) {
    if (apparition.emergence >= instrumentReleasedAt) {
        successfulCaptures++;
        instrumentReleasedAt = apparition.disappearance;
    }
}

console.log(successfulCaptures);