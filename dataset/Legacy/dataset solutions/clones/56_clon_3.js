function processStackOperation(targetStack, valueToProcess) {
    if (valueToProcess === 0) {
        const retrievedItem = targetStack.pop();
        outputValue(retrievedItem);
    } else {
        targetStack.push(valueToProcess);
    }
}

function executeProgram(){
    const dataStack = [];
    let currentInputToken;

    while ((currentInputToken = readNextToken()) === currentInputToken) {
        processStackOperation(dataStack, currentInputToken);
    }
}

function getIterationParams(argA, argB, argC) {
    if (argC === undefined) {
        return { start: 0, end: argA, callback: argB };
    } else {
        return { start: argA, end: argB, callback: argC };
    }
}

function iterateRange(param1, param2, param3){
    const iterationConfig = getIterationParams(param1, param2, param3);
    for (let loopCounter = iterationConfig.start; loopCounter < iterationConfig.end; ++loopCounter){
        if (iterationConfig.callback(loopCounter) === false){
            break;
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
let readPointer = 0;

function readNextToken(tokenType = 'number'){
    const nextRawToken = rawInputBuffer[readPointer++];
    if (tokenType === 'string') {
        return nextRawToken;
    } else {
        const numericValue = Number(nextRawToken);
        return numericValue;
    }
}

function outputValue(itemToPrint){
    console.log(itemToPrint);
}

process.stdin.on('data', function(dataChunk){
    rawInputBuffer += dataChunk;
});

process.stdin.on('end', function(){
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    executeProgram();
});
