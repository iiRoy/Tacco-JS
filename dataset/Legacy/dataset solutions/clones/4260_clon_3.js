var ioModule = require('readline');

var inputLines = [];

var inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

inputHandler.on('close', function () {
    const arraySize = parseInt(inputLines[0], 10);

    const parseNumericArray = (lineStr) => lineStr.split(" ").map(val => parseInt(val, 10));

    var arrA = parseNumericArray(inputLines[1]);
    var arrB = parseNumericArray(inputLines[2]);
    var arrC = parseNumericArray(inputLines[3]);

    arrA.sort((val1, val2) => val1 - val2);
    arrB.sort((val1, val2) => val1 - val2);
    arrC.sort((val1, val2) => val1 - val2);

    var totalCount = 0;

    // Helper function to find the index of the first element >= searchValue.
    // This is equivalent to `lower_bound` in C++.
    // Returns the count of elements strictly less than searchValue.
    function getLowerBoundIndex(searchArr, searchValue) {
        let lowIdx = 0;
        let highIdx = searchArr.length;
        while (lowIdx < highIdx) {
            let midIdx = Math.floor((lowIdx + highIdx) / 2);
            if (searchArr[midIdx] < searchValue) {
                lowIdx = midIdx + 1;
            } else {
                highIdx = midIdx;
            }
        }
        return lowIdx; // This index is also the count of elements < searchValue
    }

    // Helper function to find the index of the first element > searchValue.
    // This is equivalent to `upper_bound` in C++.
    function getUpperBoundIndex(searchArr, searchValue) {
        let lowIdx = 0;
        let highIdx = searchArr.length;
        while (lowIdx < highIdx) {
            let midIdx = Math.floor((lowIdx + highIdx) / 2);
            if (searchArr[midIdx] <= searchValue) {
                lowIdx = midIdx + 1;
            } else {
                highIdx = midIdx;
            }
        }
        return lowIdx; // This index is the first element > searchValue
    }

    for (let idxB = 0; idxB < arraySize; idxB++) {
        const currentBValue = arrB[idxB];

        // countA: number of elements in arrA strictly less than currentBValue
        const countA = getLowerBoundIndex(arrA, currentBValue);

        // countC: number of elements in arrC strictly greater than currentBValue
        // getUpperBoundIndex returns the index of the first element > currentBValue.
        // The count of such elements is arraySize - this index.
        const countC = arraySize - getUpperBoundIndex(arrC, currentBValue);
        
        totalCount += countA * countC;
    }
    console.log(totalCount);
});
