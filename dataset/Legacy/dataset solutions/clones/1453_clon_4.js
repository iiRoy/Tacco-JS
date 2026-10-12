var outputWriter = console.log;
if (typeof process != "undefined") {
    var rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunkData) {
        rawInputBuffer += chunkData;
    });
    process.stdin.on('end', function () {
        initializeProcessing(rawInputBuffer);
    });
}

function initializeProcessing(fullInputString) {
    const segmentCollection = fullInputString.split("\n");
    const intermediateSegments = segmentCollection.slice(1, segmentCollection.length - 1);
    const targetSegment = intermediateSegments.pop();
    processLineAndSort(targetSegment);
}

function processLineAndSort(inputSegment) {
    const finalNumericSequence = inputSegment.split(" ").reduce((accumulator, currentElementStr) => {
        accumulator.push(Number(currentElementStr));
        return accumulator;
    }, []);

    for (let currentIdx = 1; currentIdx < finalNumericSequence.length; currentIdx++) {
        let valueToInsert = finalNumericSequence[currentIdx];
        let comparisonIdx = currentIdx - 1;
        while (comparisonIdx >= 0 && finalNumericSequence[comparisonIdx] > valueToInsert) {
            finalNumericSequence[comparisonIdx + 1] = finalNumericSequence[comparisonIdx];
            comparisonIdx--;
        }
        finalNumericSequence[comparisonIdx + 1] = valueToInsert;
    }

    outputWriter(finalNumericSequence.join(" "));
}
