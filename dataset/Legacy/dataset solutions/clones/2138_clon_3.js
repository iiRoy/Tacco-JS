function MinHeap() {
    this.dataStore = [];
}

MinHeap.prototype = {
    insert: function(value) {
        var heapArray = this.dataStore;
        var currentIndex = heapArray.length;
        heapArray.push(value);

        while (currentIndex > 0) {
            var parentIndex = Math.floor((currentIndex - 1) / 2);
            if (heapArray[parentIndex] <= value) {
                break;
            }
            heapArray[currentIndex] = heapArray[parentIndex];
            currentIndex = parentIndex;
        }
        heapArray[currentIndex] = value;
    },

    extractMin: function() {
        var heapArray = this.dataStore;
        if (heapArray.length === 0) {
            return undefined;
        }

        var minElement = heapArray[0];
        var lastElement = heapArray.pop();

        if (heapArray.length === 0) {
            return minElement;
        }

        heapArray[0] = lastElement;
        this._siftDown(0);

        return minElement;
    },

    _siftDown: function(startIndex) {
        var heapArray = this.dataStore;
        var currentElement = heapArray[startIndex];
        var currentIndex = startIndex;
        var halfLength = Math.floor(heapArray.length / 2);

        while (currentIndex < halfLength) {
            var leftChildIndex = 2 * currentIndex + 1;
            var rightChildIndex = leftChildIndex + 1;
            var smallestChildIndex = leftChildIndex;

            if (rightChildIndex < heapArray.length && heapArray[rightChildIndex] < heapArray[leftChildIndex]) {
                smallestChildIndex = rightChildIndex;
            }

            if (currentElement <= heapArray[smallestChildIndex]) {
                break;
            }

            heapArray[currentIndex] = heapArray[smallestChildIndex];
            currentIndex = smallestChildIndex;
        }
        heapArray[currentIndex] = currentElement;
    },

    count: function() {
        return this.dataStore.length;
    },

    peek: function() {
        return this.dataStore[0];
    }
};

function numericAscendingComparator(a, b) {
    return a - b;
}

function square(num) {
    return num * num;
}

function processInput(inputString) {
    var lines = inputString.split("\n");

    var elementCountStr = lines[0];
    var elementCount = parseInt(elementCountStr, 10);

    var numbersLine = lines[1];
    var inputNumbers = numbersLine.split(" ").map(Number);

    inputNumbers.sort(numericAscendingComparator);

    var resultHeap = new MinHeap();

    var firstInputNumber = inputNumbers[0];
    var lastInputNumber = inputNumbers[elementCount - 1];
    var loopUpperBound = lastInputNumber;

    for (var currentValue = firstInputNumber; currentValue < loopUpperBound; currentValue++) {
        var currentSumOfSquares = 0;
        for (var numIndex = 0; numIndex < elementCount; numIndex++) {
            var difference = inputNumbers[numIndex] - currentValue;
            currentSumOfSquares += square(difference);
        }
        resultHeap.insert(currentSumOfSquares);
    }

    console.log(resultHeap.peek());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
