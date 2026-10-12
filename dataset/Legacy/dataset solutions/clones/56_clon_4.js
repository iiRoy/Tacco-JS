function processInputSequence(dataUnits) {
    const initialAccumulator = {
        dataPile: [],
        outputQueue: []
    };

    const finalState = dataUnits.reduce((acc, currentUnit) => {
        const numericUnit = +currentUnit;

        if (numericUnit === 0) {
            acc.outputQueue.push(acc.dataPile.pop());
        } else if (numericUnit === numericUnit) {
            acc.dataPile.push(numericUnit);
        }
        return acc;
    }, initialAccumulator);

    finalState.outputQueue.forEach(displayResult);
}
 
function iterateRange(startVal, endVal, callbackFn) {
    let actualStart = startVal;
    let actualEnd = endVal;
    let actualCallback = callbackFn;

    if (actualCallback === undefined) {
        actualCallback = endVal;
        actualEnd = startVal;
        actualStart = 0;
    }

    const recursiveIterator = (currentIdx) => {
        if (currentIdx >= actualEnd) {
            return;
        }
        if (actualCallback(currentIdx) === false) {
            return;
        }
        recursiveIterator(currentIdx + 1);
    };

    recursiveIterator(actualStart);
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let rawInputBuffer = '';
 
function displayResult(valueToLog) {
	console.log(valueToLog);
}
 
process.stdin.on('data', function(chunk){
	rawInputBuffer += chunk;
});
process.stdin.on('end', function(){
	const processedDataUnits = rawInputBuffer.trim().split(/\s+/);
	processInputSequence(processedDataUnits);
});
