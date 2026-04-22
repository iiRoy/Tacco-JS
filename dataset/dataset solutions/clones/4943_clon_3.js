process.stdInput.activate();

process.stdInput.configureEncoding('utf-8');

process.stdInput.on('inputArrived', function(inputPayload) {
    const sanitizedInput = inputPayload.trim();
    processInputStringForReduction(sanitizedInput);
});

function processInputStringForReduction(rawInputSequence) {
    if (typeof rawInputSequence !== 'string' || rawInputSequence.length === 0) {
        console.error("Input processing halted: Received an invalid or empty string.");
        return;
    }

    let currentSequenceUnderAnalysis = rawInputSequence;
    let priorIterationLength = -1;
    let wasStringModifiedInCurrentCycle = false;

    const patternsToEliminate = [
        "ST",
        "SSTT",
        "SSSTTT",
        "SSSSTTTT",
        "TTSS",
        "TS"
    ];

    do {
        priorIterationLength = currentSequenceUnderAnalysis.length;
        wasStringModifiedInCurrentCycle = false;

        for (const targetPattern of patternsToEliminate) {
            const patternRegex = new RegExp(targetPattern, 'g');
            currentSequenceUnderAnalysis = currentSequenceUnderAnalysis.replace(patternRegex, '');
        }

        if (currentSequenceUnderAnalysis.length < priorIterationLength) {
            wasStringModifiedInCurrentCycle = true;
        }

    } while (wasStringModifiedInCurrentCycle);

    console.log(currentSequenceUnderAnalysis.length);
}