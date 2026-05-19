process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputDataChunk) {
    processInputData(inputDataChunk.trim());
});

function executePatternRemovals(targetString, patternsToApply) {
    let currentWorkingString = targetString;
    for (const pattern of patternsToApply) {
        currentWorkingString = currentWorkingString.replace(pattern, "");
    }
    return currentWorkingString;
}

function processInputData(initialData) {
    let currentProcessedString = initialData;
    let previousLengthTracker = -1;

    const sequentialRemovalPatterns = ["ST", "SSTT", "SSSTTT", "SSSSTTTT"];

    currentProcessedString = currentProcessedString.replace("ST", "");

    while (previousLengthTracker !== currentProcessedString.length) {
        previousLengthTracker = currentProcessedString.length;

        currentProcessedString = executePatternRemovals(currentProcessedString, sequentialRemovalPatterns);
    }

    console.log(currentProcessedString.length);
}
