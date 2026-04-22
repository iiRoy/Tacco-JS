function computeMagnitude(limit) {
    let runningTotal = 1;
    for (let iterator = 2; iterator <= limit; iterator++) {
        runningTotal *= iterator;
    }
    return runningTotal;
}

let dataBuffer = '';

process.stdin.on('data', function processIncoming(chunk) {
    dataBuffer += chunk.toString();
});

process.stdin.on('end', function finalizeCalculation() {
    let parsedNumeric = parseInt(dataBuffer.trim(), 10);
    let computedResult = computeMagnitude(parsedNumeric);
    process.stdout.write(computedResult.toString() + '\n');
});