const FILE_PATH_SOURCE = '/dev/stdin';
const LINE_BREAK_CHAR = '\n';
const VALUE_SEPARATOR_CHAR = ' ';

let totalComparisonsCount = 0;

// Helper function to manage file reading and initial data parsing
const retrieveAndProcessInputData = (sourcePath, dataLineIndex) => {
    const fileContentBuffer = require('fs').readFileSync(sourcePath, 'utf-8');
    const allContentLines = fileContentBuffer.split(LINE_BREAK_CHAR);
    const targetDataLine = allContentLines[dataLineIndex];
    const parsedNumericValues = targetDataLine.split(VALUE_SEPARATOR_CHAR).map(Number);
    return parsedNumericValues;
};

const performSubarrayMerge = (dataCollection, startIdx, middleIdx, endIdx) => {
    const leftSubarrayLength = middleIdx - startIdx;
    const rightSubarrayLength = endIdx - middleIdx;

    // Create temporary buffers for left and right subarrays, including space for sentinels
    const leftTempBuffer = new Array(leftSubarrayLength + 1);
    const rightTempBuffer = new Array(rightSubarrayLength + 1);

    // Populate the left temporary buffer
    for (let leftBufferPointer = 0; leftBufferPointer < leftSubarrayLength; leftBufferPointer++) {
        leftTempBuffer[leftBufferPointer] = dataCollection[startIdx + leftBufferPointer];
    }
    // Populate the right temporary buffer
    for (let rightBufferPointer = 0; rightBufferPointer < rightSubarrayLength; rightBufferPointer++) {
        rightTempBuffer[rightBufferPointer] = dataCollection[middleIdx + rightBufferPointer];
    }

    // Assign sentinel values to mark the end of each temporary buffer
    const INFINITY_SENTINEL = Number.POSITIVE_INFINITY;
    leftTempBuffer[leftSubarrayLength] = INFINITY_SENTINEL;
    rightTempBuffer[rightSubarrayLength] = INFINITY_SENTINEL;

    let currentLeftPtr = 0;
    let currentRightPtr = 0;

    // Merge elements back into the original data collection
    for (let mainArrayWritePtr = startIdx; mainArrayWritePtr < endIdx; mainArrayWritePtr++) {
        totalComparisonsCount++; // Increment the global comparison counter
        if (leftTempBuffer[currentLeftPtr] <= rightTempBuffer[currentRightPtr]) {
            dataCollection[mainArrayWritePtr] = leftTempBuffer[currentLeftPtr];
            currentLeftPtr++;
        } else {
            dataCollection[mainArrayWritePtr] = rightTempBuffer[currentRightPtr];
            currentRightPtr++;
        }
    }
};

const executeRecursiveMergeSort = (dataCollection, startIdx, endIdx) => {
    // Base case: if the subarray has 0 or 1 element, it's considered sorted
    if (startIdx + 1 < endIdx) {
        const calculatedMiddleIdx = Math.floor((startIdx + endIdx) / 2);
        executeRecursiveMergeSort(dataCollection, startIdx, calculatedMiddleIdx);
        executeRecursiveMergeSort(dataCollection, calculatedMiddleIdx, endIdx);
        performSubarrayMerge(dataCollection, startIdx, calculatedMiddleIdx, endIdx);
    }
};

// Main program execution
const numericalDataSet = retrieveAndProcessInputData(FILE_PATH_SOURCE, 1);

executeRecursiveMergeSort(numericalDataSet, 0, numericalDataSet.length);

console.log(numericalDataSet.join(VALUE_SEPARATOR_CHAR));
console.log(totalComparisonsCount);
