var inputData = require("fs").readFileSync("/dev/stdin", "utf8");
var allLines = inputData.split(/\n/);
var totalLineCount = allLines.length;

function determineMatchScores(sequenceA, sequenceB) {
    var currentHits = 0;
    var currentBlows = 0;
    const SEQUENCE_DIGIT_COUNT = 4;

    for (var digitPosition = 0; digitPosition < SEQUENCE_DIGIT_COUNT; digitPosition++) {
        var digitFromSequenceA = sequenceA[digitPosition];
        var digitFromSequenceB = sequenceB[digitPosition];

        if (digitFromSequenceA === digitFromSequenceB) {
            currentHits++;
        } else {
            for (var otherPosition = 0; otherPosition < SEQUENCE_DIGIT_COUNT; otherPosition++) {
                if (digitFromSequenceA === sequenceB[otherPosition]) {
                    currentBlows++;
                }
            }
        }
    }
    return { hits: currentHits, blows: currentBlows };
}

for (var processingIndex = 0; processingIndex < totalLineCount; processingIndex += 2) {
    var firstLineContent = allLines[processingIndex];
    var secondLineContent = allLines[processingIndex + 1];

    var firstSequenceParts = firstLineContent.trim().split(/\s/);
    var secondSequenceParts = secondLineContent.trim().split(/\s/);

    var comparisonResult = determineMatchScores(firstSequenceParts, secondSequenceParts);
    console.log(comparisonResult.hits + ' ' + comparisonResult.blows);
}
