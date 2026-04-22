const outputStream = console.log;

function orchestrateProcessing(incomingText) {
    const contentUnits = incomingText.split('\n').slice(1);

    const structuredItems = contentUnits.map(recordSegment => {
        const parts = recordSegment.split(' ');
        return {
            categoryKey: parts[0],
            metricValue: parseInt(parts[1], 10)
        };
    });

    const classifiedLedger = new Map();

    structuredItems.forEach(segment => {
        if (!classifiedLedger.has(segment.categoryKey)) {
            classifiedLedger.set(segment.categoryKey, []);
        }
        classifiedLedger.get(segment.categoryKey).push(segment.metricValue);
    });

    const orderedCategories = Array.from(classifiedLedger.keys()).sort();

    orderedCategories.forEach(currentCategory => {
        outputStream(currentCategory);
        const measurements = classifiedLedger.get(currentCategory);
        const sortedMeasures = measurements.sort((valA, valB) => valA - valB);
        outputStream(sortedMeasures.join(' '));
    });
}

orchestrateProcessing(require("fs").readFileSync("input.txt", "utf8"));