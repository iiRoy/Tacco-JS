var inputBuffer = [];
var ioHandler = require('readline');

var inputProcessor = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputProcessor.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

inputProcessor.on('close', function () {
    var sourceString = inputBuffer[0];
    var targetRank = Number(inputBuffer[1]);

    var allGeneratedSubstrings = Array.from({ length: sourceString.length }, (_, startPosition) =>
        Array.from({ length: sourceString.length - startPosition }, (_, currentLength) =>
            sourceString.substring(startPosition, startPosition + currentLength + 1)
        )
    ).flat();

    var distinctPhrases = new Set(allGeneratedSubstrings);

    var uniqueSortedPhrases = Array.from(distinctPhrases).sort();

    console.log(uniqueSortedPhrases[targetRank - 1]);
});
