var INPUT_PARSER = (function() {
    // Factory function to create an InputReader instance
    function createParser(inputString) {
        return new InputReader(inputString);
    }

    // Constructor for the InputReader, responsible for parsing input lines
    function InputReader(inputString) {
        // Store processed input lines, trimmed and split by newline
        this._linesArray = inputString.trim().split("\n");
        // Initialize current line index to 0
        this._currentLineIndex = 0;
    }

    // Method to read a single value from the current line, typically from the end (right-to-left)
    InputReader.prototype.readSingleValue = function(asString) {
        var lineData = this._linesArray;
        var lineIdx = this._currentLineIndex;
        var resultValue;

        // If the current line hasn't been split and reversed yet, process it
        if (typeof lineData[lineIdx] === "string") {
            lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
        }

        // Pop the last element (which was the first in the original order)
        resultValue = lineData[lineIdx].pop();

        // If the current line is now empty, advance to the next line
        if (!lineData[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return the value as a string or a number based on the 'asString' flag
        return asString ? resultValue : +resultValue;
    };

    // Method to read all values from the current line, advancing the line index
    InputReader.prototype.readLineValues = function(asString) {
        var lineContent = this._linesArray[this._currentLineIndex++].split(" ");
        // Return as strings or numbers
        return asString ? lineContent : lineContent.map(item => +item);
    };

    // Method to read a matrix of 'numRows' rows, where each row is split by space
    InputReader.prototype.readMatrix = function(numRows, asString) {
        var matrixRows = this._linesArray.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                         .map(rowStr => rowStr.split(" "));
        // Return as strings or numbers
        return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    // Method to read 'numRows' as a list of single values (each row is one value)
    InputReader.prototype.readRows = function(numRows, asString) {
        var rowValues = this._linesArray.slice(this._currentLineIndex, this._currentLineIndex += numRows);
        // Return as strings or numbers
        return asString ? rowValues : rowValues.map(item => +item);
    };

    return createParser;
})();

// Initialize the input parser with data read from standard input
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to create a multi-dimensional array initialized with a specific value
function createMultiDimArray(initialValue) {
    var args = arguments;
    var argCount = args.length;
    // Construct the array creation code dynamically
    var arrayCreationCode = "Array(args[" + --argCount + "]).fill(0).map(_ => { return " + initialValue + "; })";

    // Build nested Array.map calls for higher dimensions
    while (--argCount) {
        arrayCreationCode = "Array(args[" + argCount + "]).fill(0).map(_ => " + arrayCreationCode + ")";
    }
    // Evaluate the generated code to create the array
    return eval(arrayCreationCode);
}

// Output the result of the main processing function
console.log(processInput());

// Main function to orchestrate the problem solving
function processInput() {
    var initialAmount = inputData.readSingleValue(); // Read N
    var firstArray = inputData.readLineValues();     // Read array A
    var secondArray = inputData.readLineValues();    // Read array B

    var smallerValues = [];
    var largerValues = [];

    // First pass: collect pairs where A[idx] < B[idx]
    for (var idx = 0; idx < 3; ++idx) {
        if (firstArray[idx] < secondArray[idx]) {
            smallerValues.push(firstArray[idx]);
            largerValues.push(secondArray[idx]);
        }
    }

    // Calculate the intermediate result using the first set of pairs
    var intermediateResult = calculateMaxProfit(initialAmount, smallerValues, largerValues);

    // Reset arrays for the second pass
    smallerValues = [];
    largerValues = [];

    // Second pass: collect pairs where B[idx] < A[idx]
    for (var idx = 0; idx < 3; ++idx) {
        if (secondArray[idx] < firstArray[idx]) {
            smallerValues.push(secondArray[idx]);
            largerValues.push(firstArray[idx]);
        }
    }

    // Calculate the final result using the intermediate result and the second set of pairs
    return calculateMaxProfit(intermediateResult, smallerValues, largerValues);
}

// Function to calculate the maximum profit based on current value and item costs/profits
function calculateMaxProfit(currentValue, costs, profits) {
    var numItems = costs.length;

    // Base case: no items to process, return the current value
    if (numItems === 0) {
        return currentValue;
    }

    // Case 1: Only one item type available
    if (numItems === 1) {
        var numTransactions = currentValue / costs[0] | 0; // Calculate max integer transactions
        currentValue -= numTransactions * costs[0];        // Subtract total cost
        currentValue += numTransactions * profits[0];      // Add total profit
        return currentValue;
    }

    // Case 2: Three item types available (uses dynamic programming)
    if (numItems === 3) {
        var dynamicProgrammingTable = createMultiDimArray(-1, currentValue + 1);
        dynamicProgrammingTable[0] = currentValue; // Base case: 0 cost, current value remains

        // Iterate through each item type
        for (var itemIndex = 0; itemIndex < 3; ++itemIndex) {
            var costOfItem = costs[itemIndex];
            var profitOfItem = profits[itemIndex];

            // Iterate through possible budgets from costOfItem up to currentValue
            for (var currentBudget = costOfItem; currentBudget <= currentValue; ++currentBudget) {
                // If the previous state (currentBudget - costOfItem) is unreachable, skip
                if (dynamicProgrammingTable[currentBudget - costOfItem] === -1) {
                    continue;
                }
                // Update DP table: take the maximum of the current value for this budget
                // or the value achieved by taking the current item
                dynamicProgrammingTable[currentBudget] = Math.max(
                    dynamicProgrammingTable[currentBudget],
                    dynamicProgrammingTable[currentBudget - costOfItem] + profitOfItem
                );
            }
        }
        // Return the maximum value found in the DP table
        return Math.max(...dynamicProgrammingTable);
    }

    // Case 3: Two item types available (numItems === 2)
    var cost1, profit1, cost2, profit2;

    // Determine which item has a better profit-to-cost ratio (profit_gain / cost)
    if ((profits[0] - costs[0]) / costs[0] < (profits[1] - costs[1]) / costs[1]) {
        // If item 0 has a worse ratio, prioritize item 1
        cost1 = costs[1];
        profit1 = profits[1];
        cost2 = costs[0];
        profit2 = profits[0];
    } else {
        // Otherwise, prioritize item 0
        cost1 = costs[0];
        profit1 = profits[0];
        cost2 = costs[1];
        profit2 = profits[1];
    }

    var maxTransactionsCost1 = currentValue / cost1 | 0; // Max possible transactions for the prioritized item
    var maxAchievedValue = 0; // Initialize the maximum value found

    // Iterate through possible transactions for the prioritized item.
    // The loop limit 5000 is a hard-coded constant from the original algorithm.
    for (var offsetTransactions = 0; offsetTransactions <= 5000 && offsetTransactions <= maxTransactionsCost1; ++offsetTransactions) {
        var actualTransactionsCost1 = maxTransactionsCost1 - offsetTransactions;
        var remainingBudget = currentValue - actualTransactionsCost1 * cost1;
        var transactionsCost2 = remainingBudget / cost2 | 0; // Transactions for the second item

        remainingBudget -= transactionsCost2 * cost2; // Subtract cost of second item transactions
        remainingBudget += actualTransactionsCost1 * profit1; // Add profit from first item transactions
        remainingBudget += transactionsCost2 * profit2;       // Add profit from second item transactions

        // Update the overall maximum achieved value
        if (maxAchievedValue < remainingBudget) {
            maxAchievedValue = remainingBudget;
        }
    }
    return maxAchievedValue;
}
