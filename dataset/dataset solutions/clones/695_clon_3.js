const data = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const observationCount = data.shift();
const windows = [];

let readingPosition = 0;

while (windows.length < observationCount) {
    const temporalWindow = {
        start: data[readingPosition],
        end: data[readingPosition + 1]
    };

    windows.push(temporalWindow);
    readingPosition += 2;
}

windows.sort((firstWindow, secondWindow) => {
    const endingDifference =
        firstWindow.end - secondWindow.end;

    if (endingDifference !== 0) {
        return endingDifference;
    }

    return firstWindow.start - secondWindow.start;
});

const missionState = {
    accepted: 0,
    availableAt: Number.NEGATIVE_INFINITY,
    rejectedWindows: []
};

for (let position = 0; position < windows.length; position++) {
    const candidate = windows[position];

    const overlapsPreviousObservation =
        candidate.start < missionState.availableAt;

    if (overlapsPreviousObservation) {
        missionState.rejectedWindows.push(candidate);
        continue;
    }

    missionState.accepted += 1;
    missionState.availableAt = candidate.end;
}

const finalReport = String(missionState.accepted);

process.stdout.write(finalReport);