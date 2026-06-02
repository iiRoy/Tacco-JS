const fs = require("fs");

function calculateOddOccurrences() {
    const rawData = fs.readFileSync("/dev/stdin", "utf8");

    const parsedLines = rawData.split('\n');
    const entryCount = Number(parsedLines[0]);

    const lineFrequencies = new Map();

    for (let lineIndex = 0; lineIndex < entryCount; lineIndex++) {
        const currentLine = parsedLines[lineIndex + 1];
        lineFrequencies.set(currentLine, (lineFrequencies.get(currentLine) || 0) + 1);
    }

    let oddOccurrenceCount = 0;
    for (const frequencyValue of lineFrequencies.values()) {
        if (frequencyValue % 2 !== 0) {
            oddOccurrenceCount++;
        }
    }

    console.log(oddOccurrenceCount);
}

calculateOddOccurrences();
