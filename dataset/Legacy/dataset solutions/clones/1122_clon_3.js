var printResult = console.log;

if (typeof process !== "undefined") {
    var rawDataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        rawDataBuffer += chunk;
    });
    process.stdin.on('end', function() {
        var rawInputLines = rawDataBuffer.split("\n");
        processInputAndCalculateArea(rawInputLines);
    });
}

function parseCoordinateLine(lineContent) {
    const parts = lineContent.split(" ").filter(function(element) {
        return element !== "";
    });

    return parts.map(function(elementStr) {
        const numericValue = Number(elementStr);
        if (numericValue.toString() === "NaN") {
            return elementStr.replace(/(\r)|(\n)/g, "");
        }
        return numericValue;
    });
}

function formatFinalArea(areaValue) {
    let truncatedArea = Math.trunc(areaValue * 10) / 10;
    let areaString = truncatedArea.toString();

    if (!areaString.includes('.')) {
        areaString += '.0';
    }
    return areaString;
}

function calculateTriangleCrossProduct(point1, point2, point3) {
    const vectorA = [point2[0] - point1[0], point2[1] - point1[1]];
    const vectorB = [point3[0] - point1[0], point3[1] - point1[1]];

    return (vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]);
}

function processInputAndCalculateArea(inputLines) {
    const processedCoordinateLines = inputLines.map(parseCoordinateLine);

    const numberOfVerticesLine = processedCoordinateLines.shift();

    const polygonVertices = processedCoordinateLines;

    const firstVertex = polygonVertices[0];
    let totalSignedAreaSum = 0;
    const vertexCount = polygonVertices.length;

    for (let i = 1; i < vertexCount - 1; i++) {
        const currentVertex = polygonVertices[i];
        const nextVertex = polygonVertices[i + 1];
        totalSignedAreaSum += calculateTriangleCrossProduct(firstVertex, currentVertex, nextVertex);
    }

    const finalArea = totalSignedAreaSum / 2;

    const formattedAreaString = formatFinalArea(finalArea);

    printResult(formattedAreaString);
}
