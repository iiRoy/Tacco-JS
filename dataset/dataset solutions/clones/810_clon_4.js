var outputLine = console.log;
if (typeof process != "undefined") {
    var rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', function () {
        prepareAndExecute(rawInputBuffer);
    });
}

function prepareAndExecute(rawInputBuffer) {
    const inputLines = rawInputBuffer.split("\n");
    inputLines.shift();
    inputLines.pop();
    processInputData(inputLines);
}

function processInputData(rawInputSegments) {
    rawInputSegments.shift(); // Consume the first line (N, number of datasets)

    const numericSegments = rawInputSegments.map(segmentString =>
        segmentString.split(" ").map(partStr => Number(partStr))
    );

    const problemSets = [];
    for (let i = 0; i < numericSegments.length; i += 2) {
        problemSets.push([numericSegments[i], numericSegments[i + 1]]);
    }

    problemSets.forEach(currentSet => {
        const powerValue = currentSet[0][1];
        const sourceArray = currentSet[1];

        const deltaValues = sourceArray.slice(1).map((currentVal, idx) =>
            currentVal - sourceArray[idx]
        );

        deltaValues.sort((valA, valB) => valB - valA);

        const relevantDeltas = deltaValues.filter((_, idx) => idx >= powerValue - 1);

        const totalSum = relevantDeltas.reduce((accumulator, current) => accumulator + current, 0);
        
        outputLine(totalSum);
    });
}
