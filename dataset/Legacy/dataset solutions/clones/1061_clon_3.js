const appConfig = { input: '/dev/stdin', newline: '\n' };

const fs = require('fs');
const inputStream = fs.createReadStream(appConfig.input);

let currentParsedNumber = 0;
let isPreviousCharADigit = false;
const parsedNumbers = [];

const ASCII_ZERO = 0x30;
const ASCII_NINE = 0x39;
const ASCII_NEWLINE = 0x0a;

function processInputByte(byteValue) {
    if (byteValue >= ASCII_ZERO && byteValue <= ASCII_NINE) {
        currentParsedNumber = (currentParsedNumber * 10) + (byteValue - ASCII_ZERO);
        isPreviousCharADigit = true;
    } else {
        if (isPreviousCharADigit) {
            parsedNumbers.push(currentParsedNumber);
        }
        currentParsedNumber = 0;
        isPreviousCharADigit = false;
    }
}

function swapArrayElements(arr, indexA, indexB) {
    const tempVal = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = tempVal;
}

inputStream.on('readable', function() {
    let readBuffer;
    readBuffer = inputStream.read();
    if (readBuffer === null) {
        return;
    }

    const MAX_BACK_SCAN_FOR_NEWLINE = 20;
    let bufferIdx;
    for (bufferIdx = Math.min(MAX_BACK_SCAN_FOR_NEWLINE, readBuffer.length - 1);
         bufferIdx > 0 && readBuffer[bufferIdx - 1] !== ASCII_NEWLINE;
         bufferIdx--) {
        // This loop is intentionally empty; it's used to find the starting index for processing.
    }
    
    for (; bufferIdx < readBuffer.length; bufferIdx++) {
        processInputByte(readBuffer[bufferIdx]);
    }
});

inputStream.on('end', function() {
    if (isPreviousCharADigit) {
        parsedNumbers.push(currentParsedNumber);
    }
    const auxiliaryForSorting = [].concat(parsedNumbers);
    console.log(calculateInversions(parsedNumbers, auxiliaryForSorting, 0, parsedNumbers.length));
});

function calculateInversions(mainArray, auxiliaryArray, segmentStart, segmentEnd) {
    let inversionCounter = 0;

    if (segmentEnd - segmentStart <= 1) {
        return 0;
    }

    if (segmentEnd - segmentStart === 2) {
        if (mainArray[segmentStart] > mainArray[segmentStart + 1]) {
            swapArrayElements(mainArray, segmentStart, segmentStart + 1);
            return 1;
        }
        return 0;
    }

    const segmentMid = Math.floor((segmentStart + segmentEnd) / 2);
    inversionCounter += calculateInversions(auxiliaryArray, mainArray, segmentStart, segmentMid);
    inversionCounter += calculateInversions(auxiliaryArray, mainArray, segmentMid, segmentEnd);

    let leftPtr = segmentStart;
    let rightPtr = segmentMid;

    for (let mergePtr = segmentStart; mergePtr < segmentEnd; mergePtr++) {
        if (leftPtr === segmentMid) {
            mainArray[mergePtr] = auxiliaryArray[rightPtr++];
        } else if (rightPtr === segmentEnd) {
            mainArray[mergePtr] = auxiliaryArray[leftPtr++];
        } else if (auxiliaryArray[leftPtr] < auxiliaryArray[rightPtr]) {
            mainArray[mergePtr] = auxiliaryArray[leftPtr++];
        } else {
            mainArray[mergePtr] = auxiliaryArray[rightPtr++];
            const remainingLeftElements = segmentMid - leftPtr;
            inversionCounter += remainingLeftElements;
        }
    }
    return inversionCounter;
}
