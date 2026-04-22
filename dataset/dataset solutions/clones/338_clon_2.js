var output = console.log; // Display function for results
var receivedLines;         // Stores all input data rows

function InitializeProcessing(sourceText) {
    receivedLines = sourceText.split("\n");
    const getNextLine = function () {
        return receivedLines.shift();
    };
    ProcessData(getNextLine);
}

function ExtractNumbers(adjustOffset) {
    let tokenizedLine = receivedLines.shift().split(' ');
    const indexShift = adjustOffset ? -1 : 0;
    const parsedNumbers = [];
    for (let currentIdx = 0; currentIdx < tokenizedLine.length; currentIdx++) {
        parsedNumbers.push(parseInt(tokenizedLine[currentIdx]));
    }
    return parsedNumbers;
}

/**
 * Computes the aggregate sum of numeric elements in an array.
 * @returns {number} The total sum.
 */
Array.prototype.CalculateTotal = function CalculateTotal() {
    let totalValue = 0;
    this.forEach(function (elementItem) {
        totalValue += elementItem;
    });
    return totalValue;
};

/**
 * Converts array elements to a string, joined by a specified separator.
 * @returns {string} The formatted string.
 */
Array.prototype.ToStringWithDelimiter = function ToStringWithDelimiter(delimiterString) {
    if (delimiterString === undefined) {
        delimiterString = " ";
    }
    return this.join(delimiterString);
};

Array.prototype.CloneCollection = function CloneCollection() {
    return [].concat(this);
};

/***
 * Sorts array elements in ascending order.
 * This custom sort ensures consistent behavior across different environments.
 * It's a stable sort for primitive values.
 * @constructor // This JSDoc tag is typically for classes, but preserving the original structure.
 */
Array.prototype.OrderElements = function OrderElements() {
    this.sort(function (firstVal, secondVal) {
        if (firstVal < secondVal) return -1;
        if (firstVal > secondVal) return 1;
        return 0;
    });
    return this;
};

/*
    This section defines a utility function for creating custom comparators
    for sorting arrays of objects based on a specific property, with options
    for descending order and tie-breaking.
*/
function createKeyComparer(keyName, descendingOrder, onEquality) {
    let sortDirection = 1;
    if (descendingOrder) {
        sortDirection = -1;
    }
    return function (objA, objB) {
        if (objA[keyName] < objB[keyName]) {
            return -1 * sortDirection;
        } else if (objA[keyName] > objB[keyName]) {
            return sortDirection;
        }

        if (onEquality === undefined) {
            return 0;
        } else {
            return onEquality(objA, objB);
        }
    };
}


function ProcessData(lineProvider) {
    let categoryList = [];
    for (let loopIndex = 1; loopIndex < receivedLines.length; loopIndex++) {
        const lineSegments = receivedLines[loopIndex].split(' ');
        let itemExists = false;
        categoryList.forEach(function (groupEntry) {
            if (groupEntry[0] === lineSegments[0]) {
                groupEntry[1].push(parseInt(lineSegments[1]));
                itemExists = true;
            }
        });
        if (!itemExists) {
            categoryList.push([lineSegments[0], [parseInt(lineSegments[1])]]);
        }
    }

    categoryList.sort(createKeyComparer(0));
    for (let listCounter = 0; listCounter < categoryList.length; listCounter++) {
        output(categoryList[listCounter][0]);
        output(categoryList[listCounter][1].OrderElements().ToStringWithDelimiter());
    }
}

// InitializeProcessing(require("fs").readFileSync("/dev/stdin", "utf8")); // For standard input
InitializeProcessing(require("fs").readFileSync("input.txt", "utf8")); // For file input