const InputReaderFactory = (() => {
    const convertToNumber = (value) => Number(value);

    class InputReader {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        _ensureCurrentLineIsParsed() {
            if (typeof this.sourceLines[this.currentLineIndex] === "string") {
                this.sourceLines[this.currentLineIndex] = this.sourceLines[this.currentLineIndex].split(" ").reverse();
            }
        }

        readNextValue(returnAsString) {
            this._ensureCurrentLineIsParsed();
            const lineParts = this.sourceLines[this.currentLineIndex];
            const extractedItem = lineParts.pop();

            if (!lineParts.length) {
                this.currentLineIndex++;
            }
            return returnAsString ? extractedItem : convertToNumber(extractedItem);
        }

        readLineValues(returnAsStrings) {
            const lineContent = this.sourceLines[this.currentLineIndex++].split(" ");
            return returnAsStrings ? lineContent : lineContent.map(convertToNumber);
        }

        readMatrix(numberOfRows, returnAsStrings) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfRows);
            this.currentLineIndex += numberOfRows;
            const parsedMatrix = matrixRows.map(row => row.split(" "));
            return returnAsStrings ? parsedMatrix : parsedMatrix.map(row => row.map(convertToNumber));
        }

        readRows(numberOfRows, returnAsStrings) {
            const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfRows);
            this.currentLineIndex += numberOfRows;
            return returnAsStrings ? rows : rows.map(convertToNumber);
        }
    }

    return (sourceString) => new InputReader(sourceString);
})();

const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

const partitionAndSelectKth = (dataArray, kZeroBasedIndex) => {
    let leftPointer = 0;
    let rightPointer = dataArray.length - 1;

    while (leftPointer < rightPointer) {
        let currentLeft = leftPointer - 1;
        let currentRight = rightPointer;
        const pivotPosition = Math.floor((leftPointer + rightPointer) / 2);
        const pivotValue = dataArray[pivotPosition];

        [dataArray[pivotPosition], dataArray[rightPointer]] = [dataArray[rightPointer], dataArray[pivotPosition]];

        while (true) {
            while (currentLeft < currentRight && pivotValue < dataArray[++currentLeft]) { /* advance currentLeft */ }
            while (currentLeft < currentRight && dataArray[--currentRight] < pivotValue) { /* advance currentRight */ }

            if (currentRight <= currentLeft) {
                break;
            }
            [dataArray[currentLeft], dataArray[currentRight]] = [dataArray[currentRight], dataArray[currentLeft]];
        }

        [dataArray[rightPointer], dataArray[currentLeft]] = [dataArray[currentLeft], dataArray[rightPointer]];

        if (currentLeft < kZeroBasedIndex) {
            leftPointer = currentLeft + 1;
        } else if (kZeroBasedIndex < currentLeft) {
            rightPointer = currentLeft - 1;
        } else {
            break;
        }
    }
    return dataArray[kZeroBasedIndex];
};

const sortArrayDescending = (arr) => arr.sort((valA, valB) => valB - valA);

const calculateCombinedSums = (firstArray, secondArray, dimOne, dimTwo) => {
    const sumCollection = [];
    for (let idxOne = 0; idxOne < dimOne; idxOne++) {
        for (let idxTwo = 0; idxTwo < dimTwo; idxTwo++) {
            sumCollection.push(firstArray[idxOne] + secondArray[idxTwo]);
        }
    }
    return sumCollection;
};

const extractTopKValues = (sourceArray, countK) => {
    // The original QuickSelect finds the (a.length - k)-th smallest element,
    // which corresponds to the k-th largest element.
    // Our partitionAndSelectKth expects a 0-based index for the k-th element.
    // So, to get the top K largest, we find the element at index (sourceArray.length - countK).
    // After partitioning, elements from this index to the end are the top K largest.
    partitionAndSelectKth(sourceArray, sourceArray.length - countK);
    return sourceArray.slice(sourceArray.length - countK);
};

console.log(processInputAndCalculate());

function processInputAndCalculate() {
    const dimensionX = inputData.readNextValue();
    const dimensionY = inputData.readNextValue();
    const dimensionZ = inputData.readNextValue();
    const targetK = inputData.readNextValue();

    const arrayA = sortArrayDescending(inputData.readLineValues());
    const arrayB = sortArrayDescending(inputData.readLineValues());
    const arrayC = sortArrayDescending(inputData.readLineValues());

    let intermediateSums = calculateCombinedSums(arrayA, arrayB, dimensionX, dimensionY);

    if (targetK < intermediateSums.length) {
        intermediateSums = extractTopKValues(intermediateSums, targetK);
    }

    sortArrayDescending(intermediateSums);

    const finalResults = [];
    for (let idxC = 0; idxC < dimensionZ; idxC++) {
        const currentLoopLimit = Math.min(intermediateSums.length, targetK - idxC);
        for (let idxU = 0; idxU < currentLoopLimit; idxU++) {
            finalResults.push(arrayC[idxC] + intermediateSums[idxU]);
        }
    }

    if (targetK < finalResults.length) {
        const topKFinalResults = extractTopKValues(finalResults, targetK);
        return sortArrayDescending(topKFinalResults).join("\n");
    }
    
    return sortArrayDescending(finalResults).join("\n");
}
