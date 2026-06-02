const outputLog = console.log;

if (typeof process !== "undefined") {
    let inputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        inputBuffer += chunk;
    });
    process.stdin.on('end', function() {
        const inputLines = inputBuffer.split("\n");
        processInput(inputLines);
    });
}

function processInput(rawInputLines) {
    const coordinateSets = rawInputLines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => line.split(' ')
            .filter(str => str !== '')
            .map(Number)
        );

    outputLog(coordinateSets);

    const vertexCount = coordinateSets.length;

    const totalSignedSum = coordinateSets.reduce((accumulator, currentPoint, index, arr) => {
        const nextPoint = arr[(index + 1) % vertexCount];
        return accumulator + (currentPoint[0] * nextPoint[1] - nextPoint[0] * currentPoint[1]);
    }, 0);

    const calculatedArea = totalSignedSum / 2;

    const truncatedArea = Math.trunc(calculatedArea * 10) / 10;
    const finalOutputString = Number(truncatedArea).toFixed(1);

    outputLog(finalOutputString);
}
