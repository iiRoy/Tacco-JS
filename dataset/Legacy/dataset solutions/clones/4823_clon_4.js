process.stdin.resume();
process.stdin.setEncoding('ascii');

var accumulatedInput = "";
var parsedInputLines = [];
var currentLinePointer = 0;

process.stdin.on('data', function (chunk) {
    accumulatedInput += chunk;
});

process.on('SIGINT', function(){
    parsedInputLines = accumulatedInput.split("\n");
    processData();
    process.exit();
});

process.stdin.on('end', function () {
    parsedInputLines = accumulatedInput.split("\n");
    processData();
});

function obtainLine() {
    return parsedInputLines[currentLinePointer++];
}

function processData() {
    const [gridHeight, _] = obtainLine().split(" ").map(Number);

    const gridContent = Array.from({ length: gridHeight }, obtainLine);

    const finalOutput = gridContent
        .flatMap(item => [item, item])
        .join('\n');

    console.log(finalOutput);
}
