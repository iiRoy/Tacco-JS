var outputLog = console.log;

if (typeof process != "undefined") {
    var rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        rawInputData += chunk;
    });
    process.stdin.on('end', function() {
        var receivedLines = rawInputData.split("\n");
        processInputData(receivedLines);
    });
}

function parseLineElement(elementString) {
    var numericValue = Number(elementString);
    if (numericValue.toString() === "NaN") {
        return elementString.replace(/(\r)|(\n)/g, "");
    }
    return numericValue;
}

function formatAreaOutput(areaValue) {
    var areaString = "" + areaValue;
    var decimalPointPosition = areaString.indexOf(".");

    if (decimalPointPosition === -1) {
        areaString += ".0";
    } else {
        areaString = areaString.substring(0, decimalPointPosition + 2);
    }
    return areaString;
}

function processInputData(inputLines) {
    var processedLines = inputLines.map(function(currentLine) {
        return currentLine.split(" ").filter(function(elementStr) {
            return elementStr !== "";
        }).map(parseLineElement);
    });

    processedLines.shift();

    var polygonVertices = processedLines;

    var firstVertex = polygonVertices[0];
    var startSegmentVertex, endSegmentVertex;
    var totalSignedArea = 0;
    var vertexCount = polygonVertices.length;

    var loopUpperLimit = vertexCount - 1;
    for (var vertexIndex = 1; vertexIndex < loopUpperLimit; vertexIndex++) {
        startSegmentVertex = polygonVertices[vertexIndex];
        endSegmentVertex = polygonVertices[vertexIndex + 1];
        totalSignedArea += calculateSignedTriangleArea(firstVertex, startSegmentVertex, endSegmentVertex);
    }

    var finalAreaValue = totalSignedArea / 2;
    var formattedResult = formatAreaOutput(finalAreaValue);

    outputLog(formattedResult);
}

function calculateSignedTriangleArea(originVertex, vecA_end, vecB_end) {
    var vectorA_x = vecA_end[0] - originVertex[0];
    var vectorA_y = vecA_end[1] - originVertex[1];

    var vectorB_x = vecB_end[0] - originVertex[0];
    var vectorB_y = vecB_end[1] - originVertex[1];

    return (vectorA_x * vectorB_y - vectorA_y * vectorB_x);
}
