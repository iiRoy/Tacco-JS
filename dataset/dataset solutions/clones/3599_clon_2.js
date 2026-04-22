function InputReader(inputString)
{
    this._lines = inputString.split("\n"); // Each line from the input string
    this._currentLineIndex = 0; // Index of the next line to read
};

InputReader.prototype = {
    readSingleValue: function(parseAsNumber)
    {
        const currentLines = this._lines;
        let lineIdx = this._currentLineIndex;
        let resultValue;

        if (typeof currentLines[lineIdx] === "string") {
            currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
        }

        resultValue = currentLines[lineIdx].pop();

        if (!currentLines[lineIdx].length) {
            this._currentLineIndex++;
        }

        return parseAsNumber ? resultValue : +resultValue;
    },

    readLineValues: function(parseNumeric)
    {
        const lineSegments = this._lines[this._currentLineIndex++].split(" ");
        return parseNumeric ? lineSegments : lineSegments.map(item => +item);
    },

    readMultipleLines: function(numLines, keepAsStrings)
    {
        const allInputLines = this._lines;
        const startIdx = this._currentLineIndex;
        const resultArray = [];
        let lineCounter = 0;

        if (keepAsStrings) {
            for (; lineCounter < numLines; lineCounter++) {
                resultArray[lineCounter] = allInputLines[startIdx + lineCounter].split(" ");
            }
        }
        else {
            for (; lineCounter < numLines; lineCounter++) {
                resultArray[lineCounter] = allInputLines[startIdx + lineCounter].split(" ").map(val => +val);
            }
        }

        this._currentLineIndex += numLines;
        return resultArray;
    },
};

var dataProcessor = new InputReader(require("node:fs").readFileSync("/dev/stdin", "utf-8"));

function countInversions(inputArray) {
    var arraySize = inputArray.length;
    var inversionCount = 0;

    for (var segmentSize = 1; segmentSize < arraySize; segmentSize = segmentSize << 1) {
        var tempArray = [];
        for (var currentPosition = 0; currentPosition < arraySize;) {
            var leftStart = currentPosition;
            var rightStart = Math.min(arraySize, leftStart + segmentSize);
            var leftEnd = rightStart;
            var rightEnd = Math.min(arraySize, rightStart + segmentSize);

            while (currentPosition < rightEnd) {
                if (leftStart === leftEnd) {
                    tempArray[currentPosition] = inputArray[rightStart++];
                }
                else if (rightStart === rightEnd) {
                    tempArray[currentPosition] = inputArray[leftStart++];
                }
                else if (inputArray[leftStart] > inputArray[rightStart]) {
                    inversionCount += leftEnd - leftStart;
                    tempArray[currentPosition] = inputArray[rightStart++];
                }
                else {
                    tempArray[currentPosition] = inputArray[leftStart++];
                }
                currentPosition++;
            }
        }
        inputArray = tempArray;
    }
    return inversionCount;
}

console.log(computeResult());

function computeResult(){
    var totalElements = dataProcessor.readSingleValue();
    var numericArray = dataProcessor.readLineValues();

    if (totalElements <= 2) {
      return Math.max(...numericArray);
    }

    var targetPosition = Math.floor(totalElements * (totalElements + 1) / 4 + 1);
    var lowerBound = 2;
    var upperBound = 1_000_000_001;

    while (lowerBound < upperBound) {
        var midValue = (lowerBound + upperBound) >>> 1;
        var prefixSumArray = [0];
        for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
            prefixSumArray[elementIndex + 1] = prefixSumArray[elementIndex];
            if (numericArray[elementIndex] < midValue) {
              prefixSumArray[elementIndex + 1]--;
            }
            else {
              prefixSumArray[elementIndex + 1]++;
            }
        }
        if (countInversions(prefixSumArray) < targetPosition) {
          lowerBound = midValue + 1;
        }
        else {
          upperBound = midValue;
        }
    }
    return lowerBound - 1;
}