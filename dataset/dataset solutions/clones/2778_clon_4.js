"use strict";

const processInputData = dataCollection => {
    const targetSequence = dataCollection[0];
    const occurrenceTracker = new Map();

    for (const characterUnit of targetSequence) {
        occurrenceTracker.set(characterUnit, (occurrenceTracker.get(characterUnit) || 0) + 1);
    }

    let finalVerdict = false;
    if (occurrenceTracker.size === 2) {
        const counts = Array.from(occurrenceTracker.values());
        if (counts[0] === 2 && counts[1] === 2) {
            finalVerdict = true;
        }
    }

    process.stdout.write((finalVerdict ? 'Yes' : 'No') + '\n');
};

processInputData(require("node:fs").readFileSync(0, "utf8").trim().split('\n'));