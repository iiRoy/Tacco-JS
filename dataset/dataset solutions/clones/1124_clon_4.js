let sysOutput = console.log;
if (typeof process !== "undefined") {
    let incomingData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        incomingData += chunk;
    });
    process.stdin.on('end', function() {
        let rawInputLines = incomingData.split("\n");
        topLevelProcessor(rawInputLines);
    });
}

function topLevelProcessor(rawInputLines) {
    let processedRows = rawInputLines.map(function(lineContent) {
        return lineContent.split(" ").filter(function(segment) {
            return segment !== "";
        }).map(function(segment) {
            let numericAttempt = Number(segment);
            if (numericAttempt.toString() === "NaN") {
                return segment.replace(/(\r)|(\n)/g, "");
            }
            return numericAttempt;
        });
    });

    let finalEntry = processedRows.pop();
    if (finalEntry && finalEntry.length === 2) {
        processedRows.push(finalEntry);
    }
    processedRows.shift();

    let vertexCollection = processedRows;

    let totalPoints = vertexCollection.length;
    if (totalPoints < 3) {
        sysOutput("0.0");
        return;
    }

    let shoelaceSum = vertexCollection.reduce((accumulator, currentPoint, currentIdx, array) => {
        let nextIdx = (currentIdx + 1) % totalPoints;
        let nextPoint = array[nextIdx];
        return accumulator + (currentPoint[0] * nextPoint[1]) - (nextPoint[0] * currentPoint[1]);
    }, 0);

    let computedArea = shoelaceSum / 2;
    let formattedOutcome = computedArea.toFixed(1);
    sysOutput(formattedOutcome);
}