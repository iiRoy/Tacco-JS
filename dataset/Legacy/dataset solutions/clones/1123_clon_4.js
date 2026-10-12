const printOutput = console.log;

if (typeof process !== "undefined") {
    let rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', function() {
        const sourceLines = rawInputBuffer.split("\n");
        processCoordinates(sourceLines);
    });
}

function processCoordinates(sourceLines) {
    const transformedSegments = sourceLines.map(currentLine => {
        return currentLine.split(" ").filter(segment => segment !== "").map(segment => {
            const numericAttempt = Number(segment);
            if (numericAttempt.toString() === "NaN") {
                return segment.replace(/(\r)|(\n)/g, "");
            }
            return numericAttempt;
        });
    });

    transformedSegments.shift(); 
    
    const polygonVertices = transformedSegments;

    let cumulativeShoelaceSum = 0;
    const totalVertexCount = polygonVertices.length;

    cumulativeShoelaceSum = polygonVertices.reduce((accumulator, currentPoint, currentIndex, allPoints) => {
        const nextIndex = (currentIndex + 1) % totalVertexCount; 
        const nextPoint = allPoints[nextIndex];

        return accumulator + (currentPoint[0] * nextPoint[1] - nextPoint[0] * currentPoint[1]);
    }, 0);

    const rawCalculatedArea = cumulativeShoelaceSum / 2;

    const truncatedAreaValue = Math.trunc(rawCalculatedArea * 10) / 10;
    
    const finalAreaDisplay = truncatedAreaValue.toFixed(1);

    printOutput(finalAreaDisplay);
}
