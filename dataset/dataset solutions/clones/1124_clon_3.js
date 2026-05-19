var outputLog = console.log;

if (typeof process !== "undefined") {
    var rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(dataSegment) {
        rawInputData += dataSegment;
    });
    process.stdin.on('end', function() {
        var processedInputLines = rawInputData.split("\n");
        processInput(processedInputLines);
    });
}

function parseAndFilterLineElements(currentInputLine) {
    const splitElements = currentInputLine.split(" ");
    const filteredElements = splitElements.filter(elementCandidate => elementCandidate !== "");

    return filteredElements.map(elementCandidate => {
        const numericValue = Number(elementCandidate);
        if (isNaN(numericValue)) {
            return elementCandidate.replace(/(\r)|(\n)/g, "");
        }
        return numericValue;
    });
}

function formatAreaValue(rawAreaValue) {
    let areaAsString = String(rawAreaValue);
    let decimalPosition = areaAsString.indexOf(".");

    if (decimalPosition === -1) {
        areaAsString += ".0";
    } else {
        areaAsString = areaAsString.slice(0, decimalPosition + 2);
    }
    return areaAsString;
}

function processInput(inputDataLines) {
    let parsedLines = inputDataLines.map(currentInputLine => parseAndFilterLineElements(currentInputLine));

    const lastProcessedLine = parsedLines.pop();
    if (lastProcessedLine && lastProcessedLine.length === 2) {
        parsedLines.push(lastProcessedLine);
    }

    parsedLines.shift();

    const polygonCoordinates = parsedLines;

    const referencePoint = polygonCoordinates[0];

    let cumulativeSignedArea = 0;
    const coordinateCount = polygonCoordinates.length;

    const loopStartVertexIndex = 1;
    const loopEndVertexIndex = coordinateCount - 1;

    for (let loopIndex = loopStartVertexIndex; loopIndex < loopEndVertexIndex; loopIndex++) {
        const currentSegmentStart = polygonCoordinates[loopIndex];
        const currentSegmentEnd = polygonCoordinates[loopIndex + 1];
        cumulativeSignedArea += calculateTriangleSignedAreaContribution(referencePoint, currentSegmentStart, currentSegmentEnd);
    }

    const totalRawArea = cumulativeSignedArea / 2;

    const formattedResultString = formatAreaValue(totalRawArea);

    outputLog(formattedResultString);
}

function calculateTriangleSignedAreaContribution(basePoint, pointOne, pointTwo) {
    const vectorA = [pointOne[0] - basePoint[0], pointOne[1] - basePoint[1]];
    const vectorB = [pointTwo[0] - basePoint[0], pointTwo[1] - basePoint[1]];

    return computeVectorCrossProduct(vectorA, vectorB);
}

function computeVectorCrossProduct(vecComponentA, vecComponentB) {
    return (vecComponentA[0] * vecComponentB[1] - vecComponentA[1] * vecComponentB[0]);
}
