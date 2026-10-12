var InputParser = (function () {
    function calculateSliceEndIndex(startIndex, limitCount) {
        return +limitCount + startIndex || undefined;
    }

    function createParser(sourceString) {
        return new ParserInstance(sourceString);
    }

    function ParserInstance(sourceString) {
        this._lines = sourceString.trim().split("\n");
    }

    ParserInstance.prototype.getLineValue = function (lineNumber) {
        return this._lines[lineNumber];
    };

    ParserInstance.prototype.getLineAsArray = function (lineNumber) {
        return this.stringToArray(this._lines[lineNumber]);
    };

    ParserInstance.prototype.getSlicedValues = function (startIndex, limitCount) {
        const endIndex = calculateSliceEndIndex(startIndex, limitCount);
        return this._lines.slice(startIndex, endIndex).map(lineVal => this.stringToNumberOrString(lineVal));
    };

    ParserInstance.prototype.getSlicedArrays = function (startIndex, limitCount) {
        const endIndex = calculateSliceEndIndex(startIndex, limitCount);
        return this._lines.slice(startIndex, endIndex).map(lineVal => this.stringToArray(lineVal));
    };

    ParserInstance.prototype.stringToArray = function (inputString) {
        return inputString.split(" ").map(val => this.stringToNumberOrString(val));
    };

    ParserInstance.prototype.stringToNumberOrString = function (valueString) {
        var numericValue = +valueString;
        return (numericValue === numericValue) ? numericValue : valueString;
    };

    return createParser;
})();

var inputData = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeTradingStrategy());

function executeTradingStrategy() {
    var totalItems = +inputData.getLineValue(0);
    var itemPrices = inputData.getLineAsArray(1);

    var sellPointIndex = 0;
    // The original loop `for(var j = N - 1; N > j; j++)` effectively runs only once for j = N-1.
    // It checks if An[N-1] > An[N-2]. This is an equivalent structural rewrite.
    if (totalItems > 1 && itemPrices[totalItems - 1] > itemPrices[totalItems - 2]) {
        sellPointIndex = totalItems - 1;
    }

    var currentFunds = 1000;
    var heldItemsCount = 0;

    for (var currentIndex = 0; currentIndex < totalItems; currentIndex++) {
        var currentItemPrice = itemPrices[currentIndex];
        var nextItemPrice = itemPrices[currentIndex + 1]; // Will be undefined for the last element

        // Determine if a sell operation should occur
        // currentItemPrice > undefined evaluates to false, matching original behavior for the last element.
        var shouldExecuteSell = (sellPointIndex === currentIndex) ||
                                (currentItemPrice > nextItemPrice && heldItemsCount > 0);

        if (shouldExecuteSell) {
            currentFunds += currentItemPrice * heldItemsCount;
            heldItemsCount = 0;
            continue;
        }

        // Determine if a buy operation should occur
        // currentItemPrice < undefined evaluates to false, matching original behavior for the last element.
        var shouldExecuteBuy = (currentItemPrice < nextItemPrice && currentFunds >= currentItemPrice);

        if (shouldExecuteBuy) {
            var purchasableItems = Math.floor(currentFunds / currentItemPrice);
            heldItemsCount += purchasableItems;
            currentFunds %= currentItemPrice; // Update remaining funds
        }
    }

    return currentFunds;
}
