function processData() {
    let shouldContinueProcessing = true;
    while (shouldContinueProcessing) {
        const arraySize = readInput();
        if (arraySize === 0) {
            shouldContinueProcessing = false;
            break;
        }
        const windowSize = readInput();
        const dataArray = [];

        for (let elementIndex = 0; elementIndex < arraySize; ++elementIndex) {
            dataArray[elementIndex] = readInput();
        }

        let currentWindowSum = 0;
        for (let windowElementIndex = 0; windowElementIndex < windowSize; ++windowElementIndex) {
            currentWindowSum += dataArray[windowElementIndex];
        }

        let maximumWindowSum = currentWindowSum;

        const slidingIterations = arraySize - windowSize;
        for (let slideIndex = 0; slideIndex < slidingIterations; ++slideIndex) {
            currentWindowSum -= dataArray[slideIndex];
            const nextElementToAddIndex = windowSize + slideIndex;
            currentWindowSum += dataArray[nextElementToAddIndex];
            maximumWindowSum = Math.max(currentWindowSum, maximumWindowSum);
        }
        outputResult(maximumWindowSum);
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let rawInputData = '';
let inputDataPointer = 0;
 
function readInput(dataType) {
    const valueToProcess = rawInputData[inputDataPointer++];
    return (dataType === 'string') ? valueToProcess : +valueToProcess;
}
 
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}
 
process.stdin.on('data', function(inputChunk) {
    rawInputData += inputChunk;
});
process.stdin.on('end', function() {
    const splitInput = rawInputData.split(/\s+/);
    rawInputData = splitInput;
    processData();
});
