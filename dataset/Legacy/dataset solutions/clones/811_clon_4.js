var outputResult = console.log;

if (typeof process !== "undefined") {
    var accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        accumulatedInput += chunk;
    });
    process.stdin.on('end', function () {
        processRawInput(accumulatedInput);
    });
}

function processRawInput(rawTextData) {
    var dataLines = rawTextData.split("\n");
    dataLines.shift();
    dataLines.pop();
    analyzeDataSets(dataLines);
}

function analyzeDataSets(inputLineSegments) {
    const numericLineArrays = inputLineSegments.map(segment =>
        segment.split(' ').map(Number)
    );

    const datasetGroups = numericLineArrays.reduce((accumulator, currentArr, index) => {
        if (index % 2 === 0) {
            accumulator.push([currentArr]);
        } else {
            accumulator[accumulator.length - 1].push(currentArr);
        }
        return accumulator;
    }, []);

    datasetGroups.forEach(processSingleDataset);
}

function processSingleDataset(currentDataSet) {
    const powerParam = currentDataSet[0][1];
    const numberSequence = currentDataSet[1];

    const valueDifferences = numberSequence.slice(1).map((currentVal, index) =>
        currentVal - numberSequence[index]
    );

    valueDifferences.sort((a, b) => b - a);

    const relevantDifferences = valueDifferences.slice(powerParam - 1);

    const finalSum = relevantDifferences.reduce((total, val) => total + val, 0);

    outputResult(finalSum);
}
