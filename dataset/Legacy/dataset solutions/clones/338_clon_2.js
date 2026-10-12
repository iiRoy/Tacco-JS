var logOutput = console.log; // Output function, similar to Python's print
var sourceLines; // Stores lines read from input

/**
 * Initializes the program by splitting raw input into lines and then
 * delegates to the main processing function.
 * @param {string} rawData - The complete input string.
 */
function InitializeAndExecute(rawData) {
    sourceLines = rawData.split("\n");
    var lineFetcher = function () {
        return sourceLines.shift();
    };
    ProcessData(lineFetcher);
}

/**
 * Parses a line of space-separated integers into an array.
 * @param {boolean} subtractOneFlag - If true, subtracts 1 from each parsed integer.
 * @returns {number[]} An array of integers.
 */
function ParseIntegerList(subtractOneFlag) {
    var stringParts = sourceLines.shift().split(' ');
    var valueOffset = subtractOneFlag ? -1 : 0;
    var resultArray = [];
    for (var idx = 0; idx < stringParts.length; idx++) {
        resultArray.push(parseInt(stringParts[idx]) + valueOffset);
    }
    return resultArray;
}

/**
 * Calculates the sum of all numeric elements in an array.
 * @returns {number} The total sum.
 */
Array.prototype.CalculateTotal = function CalculateTotal() {
    var totalValue = 0;
    this.forEach(function (elementItem) {
        totalValue += elementItem;
    });
    return totalValue;
};

/**
 * Formats array elements into a string, joined by a specified separator.
 * @param {string} [separatorChar=" "] - The character(s) to use as a separator.
 * @returns {string} The formatted string.
 */
Array.prototype.FormatWithDelimiter = function FormatWithDelimiter(separatorChar) {
    if (separatorChar === undefined) {
        separatorChar = " ";
    }
    return this.join(separatorChar);
};

/**
 * Creates a shallow copy of the array.
 * @returns {Array} A new array containing the same elements.
 */
Array.prototype.DuplicateArray = function DuplicateArray() {
    return [].concat(this);
};

/**
 * Sorts the array in ascending order.
 * This method modifies the array in place.
 * @returns {Array} The sorted array (this).
 */
Array.prototype.SortAscending = function SortAscending() {
    this.sort(function (itemA, itemB) {
        if (itemA < itemB) return -1;
        if (itemA > itemB) return 1;
        return 0;
    });
    return this;
};

/**
 * Generates a comparison function for sorting objects based on a specific key.
 * Supports ascending/descending order and an optional tie-breaker function.
 * @param {string|number} keyName - The property name or index to compare.
 * @param {boolean} [descendingOrder=false] - True for descending sort, false for ascending.
 * @param {function} [tieBreakerFunction] - A function to call if key values are equal.
 * @returns {function(Object, Object): number} A comparison function for Array.prototype.sort.
 */
function createObjectKeyComparator(keyName, descendingOrder, tieBreakerFunction) {
    var sortDirection = 1;
    if (descendingOrder) {
        sortDirection = -1;
    }
    return function (objA, objB) {
        if (objA[keyName] < objB[keyName]) return -1 * sortDirection;
        else if (objA[keyName] > objB[keyName]) return sortDirection;

        if (tieBreakerFunction === undefined) {
            return 0;
        } else {
            return tieBreakerFunction(objA, objB);
        }
    };
}

/**
 * Main processing logic of the application.
 * Reads data, aggregates it, sorts, and prints the results.
 * @param {function(): string} fetchNextLine - A function to get the next line of input.
 */
function ProcessData(fetchNextLine) {
    var dataCollection = [];
    // Loop through input lines, starting from the second line (index 1)
    // as the first line might be a header or count (not used here).
    for (var loopIndex = 1; loopIndex < sourceLines.length; loopIndex++) {
        var currentLineParts = sourceLines[loopIndex].split(' ');
        var foundExistingEntry = false;
        // Check if an entry with the current key already exists in dataCollection
        dataCollection.forEach(function (entryItem) {
            if (entryItem[0] === currentLineParts[0]) {
                entryItem[1].push(parseInt(currentLineParts[1]));
                foundExistingEntry = true;
            }
        });
        // If no existing entry was found, create a new one
        if (!foundExistingEntry) {
            dataCollection.push([currentLineParts[0], [parseInt(currentLineParts[1])]]);
        }
    }

    // Sort the collected data based on the first element (key)
    dataCollection.sort(createObjectKeyComparator(0));

    // Iterate through the sorted data and print results
    for (var loopIndex = 0; loopIndex < dataCollection.length; loopIndex++) {
        logOutput(dataCollection[loopIndex][0]);
        // Sort the associated numbers and format them for output
        logOutput(dataCollection[loopIndex][1].SortAscending().FormatWithDelimiter());
    }
}

// Execute the program by reading from a file.
// For competitive programming, this often reads from /dev/stdin.
InitializeAndExecute(require("fs").readFileSync("input.txt", "utf8"));
