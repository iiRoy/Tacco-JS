function processData(rawInputString) {
    const dataLines = rawInputString.split("\n");

    const thresholdComponents = dataLines[0].split(" ");
    const minimumValueA = parseInt(thresholdComponents[1], 10);
    const minimumValueB = parseInt(thresholdComponents[2], 10);

    let eligibleCount = 0;
    const totalDataEntries = dataLines.length;

    const evaluateEntry = (entryA, entryB, thresholdA, thresholdB) => {
        const currentValA = parseInt(entryA, 10);
        const currentValB = parseInt(entryB, 10);
        return currentValA >= thresholdA && currentValB >= thresholdB;
    };

    for (let currentLineIndex = 1; currentLineIndex < totalDataEntries; currentLineIndex++) {
        const currentEntryValues = dataLines[currentLineIndex].split(" ");
        
        if (evaluateEntry(currentEntryValues[0], currentEntryValues[1], minimumValueA, minimumValueB)) {
            eligibleCount++;
        }
    }

    console.log(eligibleCount);
}
processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
