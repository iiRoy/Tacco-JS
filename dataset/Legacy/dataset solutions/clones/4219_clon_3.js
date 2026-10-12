function processInputAndCompute(inputContent) {
    const LINE_DELIMITER = "\n";
    var inputParts = inputContent.split(LINE_DELIMITER);
    var targetSequenceIndex = Number(inputParts[0]);

    var finalCalculatedValue = calculateSequenceValue(targetSequenceIndex);

    console.log(finalCalculatedValue.toString());
}

function calculateSequenceValue(sequenceIndex) {
    if (sequenceIndex === 0) {
        return 2n;
    }
    if (sequenceIndex === 1) {
        return 1n;
    }

    var previousPreviousTerm = 2n;
    var previousTerm = 1n;
    var currentTermResult = 0n;

    for (var loopIterator = 2; loopIterator <= sequenceIndex; loopIterator++) {
        var intermediateSum = previousPreviousTerm + previousTerm;
        previousPreviousTerm = previousTerm;
        previousTerm = intermediateSum;
        currentTermResult = intermediateSum;
    }

    return currentTermResult;
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
