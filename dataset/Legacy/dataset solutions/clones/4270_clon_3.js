process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputAccumulator = '';
process.stdin.on('data', function(dataChunk) {
    inputAccumulator += dataChunk;
});

process.stdin.on('end', function() {
    const rawInputLines = inputAccumulator.split(/\r?\n/);
    calculateAndDisplay(rawInputLines);
});

function parseLineAsInt(lineContent) {
    return parseInt(lineContent, 10);
}

function calculateAndDisplay(inputLines) {
    const multiplierConstant = 2;

    var firstNum = parseLineAsInt(inputLines[0]);
    var secondNum = parseLineAsInt(inputLines[1]);

    var intermediateProduct = multiplierConstant * secondNum;
    var finalResult = intermediateProduct - firstNum;

    console.log(finalResult);

    return 0;
}
