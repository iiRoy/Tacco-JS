var DATA_PARSER = (function () {
    // Factory function to create an input processor instance
    function createParser(inputStr) {
        return new InputProcessor(inputStr);
    }

    // Constructor for the InputProcessor class
    function InputProcessor(inputStr) {
        // Store processed lines, trimming whitespace and splitting by newline
        this._sourceLines = inputStr.trim().split("\n");
    }

    // Prototype methods for InputProcessor
    InputProcessor.prototype.getLineValue = function (lineIndex) {
        // Retrieve a specific line by index
        return this._sourceLines[lineIndex];
    };

    InputProcessor.prototype.getLineAsArray = function (lineIndex) {
        // Retrieve a specific line and convert it to an array of values
        return this.stringToArray(this._sourceLines[lineIndex]);
    };

    InputProcessor.prototype.extractRange = function (startIndex, count) {
        // Extract a range of lines and convert each to a number or string
        // The limit calculation handles cases where count might be 0 or undefined
        return this._sourceLines.slice(startIndex, +count + startIndex || undefined).map(itemVal => this.stringToNumberOrString(itemVal));
    };

    InputProcessor.prototype.extractRangeAsArrays = function (startIndex, count) {
        // Extract a range of lines and convert each to an array of values
        return this._sourceLines.slice(startIndex, +count + startIndex || undefined).map(itemVal => this.stringToArray(itemVal));
    };

    InputProcessor.prototype.stringToArray = function (lineStr) {
        // Convert a space-separated string into an array of numbers or strings
        return lineStr.split(" ").map(itemVal => this.stringToNumberOrString(itemVal));
    };

    InputProcessor.prototype.stringToNumberOrString = function (itemVal) {
        // Attempt to convert a string value to a number; if not a valid number, return the original string
        var parsedNum = +itemVal;
        return (parsedNum === parsedNum) ? parsedNum : itemVal; // Check for NaN
    };

    // Return the factory function
    return createParser;
})();

// Initialize the input data processor by reading from standard input
var inputData = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main calculation function
console.log(calculateMaxProfit());

/**
 * Main function to calculate the maximum profit based on item prices.
 * This simulates buying and selling items to maximize capital.
 * @returns {number} The final capital after all transactions.
 */
function calculateMaxProfit(){
    // Get the total number of items from the first line of input
    var totalItems = inputData.getLineValue(0);
    // Get the array of item prices from the second line of input
    var itemPrices = inputData.getLineAsArray(1);

    // Find the index of the last peak (where price starts decreasing)
    var lastPeakIndex = 0;
    // Iterate backwards from the second to last item
    for(var reverseIdx = totalItems - 1; totalItems > reverseIdx; reverseIdx++) {
        // If the current item's price is greater than the previous one, this is a peak
        if (itemPrices[reverseIdx] > itemPrices[reverseIdx - 1]) {
            lastPeakIndex = reverseIdx; // Store the index of this peak
            break; // Exit the loop as we found the last relevant peak
        }
    }

    // Initialize current capital and the number of items currently held
    var currentCapital = 1000; // Starting capital
    var heldItemsCount = 0;   // Number of items bought and currently held

    // Iterate through the item prices to perform transactions
    for(var itemIdx = 0; totalItems > itemIdx; itemIdx++) {
        // Condition to sell:
        // 1. If we are at the last peak index, sell all held items.
        // 2. If the current item's price is higher than the next item's price AND we hold items, sell.
        if (lastPeakIndex === itemIdx || (itemPrices[itemIdx] > itemPrices[itemIdx + 1] && heldItemsCount > 0)) {
            currentCapital += itemPrices[itemIdx] * heldItemsCount; // Add proceeds from selling held items
            heldItemsCount = 0; // Reset held items count
            continue; // Move to the next item
        }

        // Condition to buy:
        // If the current item's price is lower than the next item's price AND we have enough capital to buy
        if (itemPrices[itemIdx] < itemPrices[itemIdx + 1] && currentCapital >= itemPrices[itemIdx]) {
            var remainder = currentCapital % itemPrices[itemIdx]; // Calculate remaining capital after buying max items
            heldItemsCount = (currentCapital - remainder) / itemPrices[itemIdx]; // Calculate how many items can be bought
            currentCapital = remainder; // Update capital with the remainder
        }
    }

    // Return the final calculated capital
    return currentCapital;
}
