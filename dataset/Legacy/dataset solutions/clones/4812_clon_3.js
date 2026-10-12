process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawDataBuffer = "";
let lineDataArray = [];
let currentLineIndex = 0;

process.stdin.on('data', function (chunk) {
    rawDataBuffer += chunk;
});

const finalizeInputAndExecute = () => {
    lineDataArray = rawDataBuffer.split("\n");
    processInputAndCalculate();
};

process.on('SIGINT', function(){
    finalizeInputAndExecute();
    process.exit();
});

process.stdin.on('end', function () {
    finalizeInputAndExecute();
});

function fetchNextLine() {
    return lineDataArray[currentLineIndex++];
}

/////////////// ignore above this line ////////////////////

function processInputAndCalculate() {
    const arraySize = parseInt(fetchNextLine(), 10);
    
    const inputStringParts = fetchNextLine().split(" ");
    const inputNumbers = inputStringParts.map(Number);

    const frequencyCounts = new Array(arraySize).fill(2);
    frequencyCounts[0] = 1;

    for (let idx = 0; idx < arraySize; idx++) {
        const currentNumber = inputNumbers[idx];
        frequencyCounts[currentNumber]--;
    }
    
    const startIndexForCheck = (arraySize % 2 === 1) ? 0 : 1;
    
    const checkParityCounts = (start, limit, step) => {
        for (let k = start; k < limit; k += step) {
            if (frequencyCounts[k] !== 0) {
                return false;
            }
        }
        return true;
    };

    if (!checkParityCounts(startIndexForCheck, arraySize, 2)) {
        console.log("0");
        return;
    }
    
    const exponent = Math.floor((arraySize - 1) / 2);
    const resultValue = Math.pow(2, exponent);
    
    console.log(resultValue.toString());
}
