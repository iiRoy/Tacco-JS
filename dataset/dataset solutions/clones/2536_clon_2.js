var InputDataProcessorFactory = (function () {
    // This function serves as the entry point for creating a new data processor instance.
    function createInputProcessor(inputString) {
        return new InputProcessor(inputString);
    }

    // The InputProcessor class handles parsing and accessing input data.
    function InputProcessor(inputString) {
        // Store processed lines after trimming whitespace and splitting by newline.
        this._inputLines = inputString.trim().split("\n");
    }

    // Retrieves a specific line by its index.
    InputProcessor.prototype.getValue = function (lineIndex) {
        return this._inputLines[lineIndex];
    };

    // Retrieves a specific line, parses it into an array of values.
    InputProcessor.prototype.getArray = function (lineIndex) {
        return this.convertLineToArray(this._inputLines[lineIndex]);
    };

    // Extracts a slice of lines and converts each line to a single value.
    InputProcessor.prototype.slice = function (startIndex, sliceLimit) {
        // The `+sliceLimit + startIndex || undefined` handles cases where sliceLimit might be 0 or null.
        return this._inputLines.slice(startIndex, +sliceLimit + startIndex || undefined).map(currentValue => this.parseValue(currentValue));
    };

    // Extracts a slice of lines and converts each line to an array of values.
    InputProcessor.prototype.sliceArray = function (startIndex, sliceLimit) {
        return this._inputLines.slice(startIndex, +sliceLimit + startIndex || undefined).map(currentValue => this.convertLineToArray(currentValue));
    };

    // Converts a single string line into an array of parsed values.
    InputProcessor.prototype.convertLineToArray = function (inputString) {
        return inputString.split(" ").map(currentValue => this.parseValue(currentValue));
    };

    // Attempts to convert a string value to a number; otherwise, returns the original string.
    InputProcessor.prototype.parseValue = function (currentValue) {
        var parsedNumber = +currentValue; // Unary plus operator attempts conversion to number.
        // Check if the conversion resulted in a valid number (not NaN).
        return (parsedNumber === parsedNumber) ? parsedNumber : currentValue;
    };

    return createInputProcessor; // Return the factory function.
})();

// Initialize the data handler by reading from standard input.
var dataHandler = InputDataProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to dynamically create multi-dimensional arrays.
function generateMultiDimensionalArray(initialValueExpression) {
    var functionArguments = arguments,
        argLength = functionArguments.length,
        arrayCreationString = "Array(functionArguments[" + --argLength + "]).fill(0).map(_=>{return " + initialValueExpression + ";})";
    while (--argLength) {
        arrayCreationString = "Array(functionArguments[" + argLength + "]).fill(0).map(_=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString); // Use eval to execute the dynamically constructed array creation string.
}


// Output the result of the main computation.
console.log(main());

// Main function encapsulating the problem's logic.
function main() {
    // Read the first line containing N and M.
    var firstLineParameters = dataHandler.getArray(0);
    var numberOfItems = firstLineParameters[0]; // N
    var numberOfKeys = firstLineParameters[1];   // M

    // Read the subsequent lines containing key information.
    var rawKeyInformation = dataHandler.sliceArray(1);
    var keyConfigurations = []; // Array to store processed key objects.
    var unusedAccumulator = 0; // This variable is calculated but not used in the final result.

    // This loop calculates a sum of powers of 2, but its result is not utilized later.
    for (var itemCounter = numberOfItems; itemCounter > 0; itemCounter--) {
        unusedAccumulator += 1 << itemCounter;
    }

    // Process raw key information into structured objects.
    // Each key consists of a cost and a bitmask representing covered items.
    for (var configIndex = 0; numberOfKeys * 2 > configIndex; configIndex = configIndex + 2) {
        keyConfigurations.push({
            costAmount: rawKeyInformation[configIndex][0], // The cost associated with this key.
            bitmaskValue: rawKeyInformation[configIndex + 1].reduce(function (accumulator, currentItem) {
                // Create a bitmask where each bit represents an item (1-indexed, so c-1).
                return accumulator | 1 << (currentItem - 1);
            }, 0) // Initial accumulator value is 0.
        });
    }

    // Initialize a dynamic programming table.
    // `minimumCosts[state]` will store the minimum cost to reach `state` (a bitmask).
    var minimumCosts = (new Array(1 << numberOfItems)).fill(Infinity);
    minimumCosts[0] = 0; // Cost to reach the initial state (no items covered) is 0.

    // Iterate through all possible bitmask states.
    for (var currentBitmaskState = 0; 1 << numberOfItems > currentBitmaskState; currentBitmaskState++) {
        // For each state, try applying every available key configuration.
        for (var keyOptionIterator = 0; numberOfKeys > keyOptionIterator; keyOptionIterator++) {
            // Calculate the next state by OR-ing the current state with the key's bitmask.
            var nextBitmaskState = currentBitmaskState | keyConfigurations[keyOptionIterator].bitmaskValue;
            // Calculate the cost to reach this new state.
            var calculatedTotalCost = minimumCosts[currentBitmaskState] + keyConfigurations[keyOptionIterator].costAmount;

            // Update the minimum cost for the `nextBitmaskState` if a cheaper path is found.
            minimumCosts[nextBitmaskState] = Math.min(minimumCosts[nextBitmaskState], calculatedTotalCost);
        }
    }

    // The target state is when all items are covered, represented by (1 << numberOfItems) - 1.
    // If the cost for this state is still Infinity, it means it's unreachable, so return -1.
    return minimumCosts[(1 << numberOfItems) - 1] === Infinity ? -1 : minimumCosts[(1 << numberOfItems) - 1];
}
