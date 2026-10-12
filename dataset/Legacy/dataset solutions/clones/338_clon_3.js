const logOutput = console.log;
let rawInputLines;

function initializeAndProcess(inputContent) {
    rawInputLines = inputContent.split("\n");
    const lineFetcher = () => rawInputLines.shift();
    // The original Main function (now processData) does not use the lineFetcher argument.
    // This behavior is preserved.
    processData(lineFetcher);
}

function parseIntegerList(adjustForOneBased) {
    const lineContent = rawInputLines.shift();
    const lineParts = lineContent.split(' ');
    // This variable is declared and assigned in the original, but never used.
    // This behavior is preserved.
    const indexAdjustment = adjustForOneBased ? -1 : 0;
    const parsedNumbers = [];
    for (let idx = 0; idx < lineParts.length; idx++) {
        parsedNumbers.push(parseInt(lineParts[idx]));
    }
    return parsedNumbers;
}

Array.prototype.calculateSum = function calculateSum() {
    return this.reduce((totalSum, elementValue) => totalSum + elementValue, 0);
};

Array.prototype.formatArray = function formatArray(delimiter = " ") {
    return this.join(delimiter);
};

Array.prototype.createShallowCopy = function createShallowCopy() {
    return this.slice();
};

Array.prototype.sortInPlace = function sortInPlace() {
    this.sort((itemA, itemB) => {
        if (itemA < itemB) return -1;
        if (itemA > itemB) return 1;
        return 0;
    });
    return this;
};

function createKeyBasedComparator(propertyKey, isDescending, tieBreakerFunction) {
    const sortDirection = isDescending ? -1 : 1;

    const comparePrimaryValues = (valA, valB) => {
        if (valA < valB) return -1 * sortDirection;
        if (valA > valB) return sortDirection;
        return 0;
    };

    return function (itemA, itemB) {
        const primaryComparisonResult = comparePrimaryValues(itemA[propertyKey], itemB[propertyKey]);
        if (primaryComparisonResult !== 0) {
            return primaryComparisonResult;
        }
        // If primary keys are equal, use the tieBreakerFunction if provided, otherwise return 0.
        return tieBreakerFunction ? tieBreakerFunction(itemA, itemB) : 0;
    };
}

function processData(unusedLineFetcher) {
    const groupedItems = [];

    // The original code iterates rawInputLines directly from index 1,
    // without consuming elements via shift(). This behavior is preserved.
    rawInputLines.slice(1).forEach(lineContent => {
        const currentLineParts = lineContent.split(' ');
        const itemKey = currentLineParts[0];
        const itemValue = parseInt(currentLineParts[1]);

        let existingGroup = groupedItems.find(group => group[0] === itemKey);

        if (existingGroup) {
            existingGroup[1].push(itemValue);
        } else {
            groupedItems.push([itemKey, [itemValue]]);
        }
    });

    groupedItems.sort(createKeyBasedComparator(0));

    groupedItems.forEach(group => {
        logOutput(group[0]);
        logOutput(group[1].sortInPlace().formatArray());
    });
}

initializeAndProcess(require("fs").readFileSync("input.txt", "utf8"));
