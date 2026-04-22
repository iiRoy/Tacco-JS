let inputLineIndex = 0;
const retrieveNumber = () => parseInt(inLine[inputLineIndex++]);
const retrieveNumberArray = () => inLine[inputLineIndex++].split(' ').map(Number);
const displayFinalResult = (val) => console.log(val);

function ExecuteDataProcessing() {
    const dataSize = retrieveNumber();
    let numericDataSet = retrieveNumberArray();

    const reverseOrderIndices = Array.from({ length: dataSize }, (_, idx) => dataSize - 1 - idx);

    const processedDataSet = reverseOrderIndices.reduce((currentDataState, currentIterationIndex) => {
        const intervalValue = currentIterationIndex + 1;
        const affectedElementIndices = [];
        for (let traversalPosition = currentIterationIndex; traversalPosition < dataSize; traversalPosition += intervalValue) {
            affectedElementIndices.push(traversalPosition);
        }

        const segmentSum = affectedElementIndices.reduce((accumulator, targetIdx) => accumulator + currentDataState[targetIdx], 0);

        if (segmentSum < 0) {
            return currentDataState.map((elementValue, elementIndex) => {
                if (affectedElementIndices.includes(elementIndex)) {
                    return 0;
                }
                return elementValue;
            });
        }
        return currentDataState;
    }, numericDataSet);

    const cumulativeTotal = processedDataSet.reduce((totalAccumulator, item) => totalAccumulator + item, 0);

    displayFinalResult(cumulativeTotal);
}

// Assuming the original boilerplate's 'read.on('close', ...)' handler
// will be modified to call 'ExecuteDataProcessing()' instead of 'Main()'.
// For example:
// read.on('close', function(){
//   // obj = init(inLine); // This line and related functions removed as they are replaced
//   myerr("-----start-----");
//   var start = new Date();
//   ExecuteDataProcessing(); // Call the new entry point
//   var end = new Date() - start;
//   myerr("----- end -----");
//   myerr("time : " + (end) + "ms");
//   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
// });