process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawInputBuffer = "";
let inputLinesArray = [];
let currentLineIndex = 0;

process.stdin.on('data', function (chunkOfData) {
    rawInputBuffer += chunkOfData;
});

process.on('SIGINT', function(){
    inputLinesArray = rawInputBuffer.split("\n");
    executeProgram();
    process.exit();
});

process.stdin.on('end', function () {
    inputLinesArray = rawInputBuffer.split("\n");
    executeProgram();
});

function fetchNextLine() {
    return inputLinesArray[currentLineIndex++];
}

// --- End of input handling boilerplate ---

function executeProgram() {
    let elementCount = parseInt(fetchNextLine());
    let inputValues = [], frequencyTracker = [];
    let lineParts = fetchNextLine().split(" ");

    for (let idx = 0; idx < elementCount; idx++) {
        inputValues.push(parseInt(lineParts[idx]));
        frequencyTracker.push(2);
    }

    frequencyTracker[0] = 1;

    for (let idx = 0; idx < elementCount; idx++) {
        frequencyTracker[inputValues[idx]]--;
    }
    
    // --- Validation check ---
    let startOffset;
    if (elementCount % 2 === 1) {
        startOffset = 0;
    } else {
        startOffset = 1;
    }
    
    for (let idx = startOffset; idx < elementCount; idx += 2) {
        if (frequencyTracker[idx] !== 0) {
            console.log("0");
            return;
        }
    }
    
    // --- Calculate final result ---
    let finalResult = 1;
    for (let idx = 1; idx < elementCount; idx += 2) {
        finalResult *= 2;
    }
    console.log(finalResult.toString());
}
