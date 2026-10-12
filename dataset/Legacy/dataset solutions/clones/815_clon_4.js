function* parseInputData(inputLines) {
    let currentLinePointer = 0;
    while (true) {
        const headerValues = inputLines[currentLinePointer++].split(/\s+/).map(Number);
        const populationSize = headerValues[0];
        const eventCount = headerValues[1];

        if (populationSize === 0 && eventCount === 0) {
            return;
        }

        const transmissionRecords = [];
        for (let i = 0; i < eventCount; i++) {
            const recordDetails = inputLines[currentLinePointer++].split(/\s+/).map(Number);
            transmissionRecords.push({
                timestamp: recordDetails[0],
                sourcePerson: recordDetails[1] - 1,
                targetPerson: recordDetails[2] - 1
            });
        }
        
        transmissionRecords.sort((recA, recB) => recA.timestamp - recB.timestamp);

        yield {
            totalPopulation: populationSize,
            eventSequence: transmissionRecords
        };
    }
}

process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function (inputChunk) {
    const allInputLines = inputChunk.trim().split("\n");

    for (const currentScenario of parseInputData(allInputLines)) {
        const initiallyCured = new Set([0]); // Person at index 0 is always considered cured/uninfected

        const finalCuredState = currentScenario.eventSequence.reduce((currentCuredSet, transmissionEvent) => {
            if (currentCuredSet.has(transmissionEvent.sourcePerson)) {
                currentCuredSet.add(transmissionEvent.targetPerson);
            }
            return currentCuredSet;
        }, initiallyCured);

        console.log(finalCuredState.size);
    }
});
