function ProcessInput(inputData) {
    "use strict";

    // Helper function for creating RangeError messages
    const createRangeError = (index) => new RangeError(`Index out of bounds at position '${index}'`);
    // Helper function for creating TypeError messages
    const createTypeError = (value) => new TypeError(`'${value}' cannot convert to Number`);

    // Depth-first search function to calculate the maximum score path
    function calculateMaxScore(currentNode, currentScore, currentDepth) {
        let maximumPathScore = 0;
        const currentOutgoingPaths = allowedPaths[currentNode];

        // Guard clause: if there are no allowed outgoing paths from the current node,
        // or if the array is empty, return the current accumulated score.
        if (!currentOutgoingPaths || currentOutgoingPaths.length === 0) {
            return currentScore;
        }

        // Iterate over each possible next node from the current node
        for (const nextNode of currentOutgoingPaths) {
            // Check if the score for this specific path segment (currentNode -> nextNode)
            // has already been computed and memoized.
            if (!memoizedScores[currentNode] || !memoizedScores[currentNode][nextNode]) {
                const edgeWeight = graphData[currentNode][nextNode];
                const newAccumulatedScore = currentScore + edgeWeight;

                // Recursively call calculateMaxScore for the next node.
                // Note: 'memoizedScores' is passed as a 4th argument here,
                // but the function signature of 'calculateMaxScore' does not declare it.
                // This replicates the original code's behavior where 'memoizedScores'
                // is accessed via closure from the outer scope.
                const computedSegmentResult = calculateMaxScore(nextNode, newAccumulatedScore, currentDepth + 1, memoizedScores);

                // Ensure the memoization array for the current node exists before assigning.
                // This is a defensive check, though 'memoizedScores[currentNode]' should already be an array
                // due to the initialization logic for 'allowedPaths' and 'graphData'.
                if (!memoizedScores[currentNode]) {
                    memoizedScores[currentNode] = [];
                }
                // Store the computed score for this path segment in the memoization table.
                memoizedScores[currentNode][nextNode] = computedSegmentResult;
            }

            // Update the overall maximum path score found from the current node.
            maximumPathScore = Math.max(maximumPathScore, memoizedScores[currentNode][nextNode]);
        }
        return maximumPathScore;
    }

    const logOutput = console.log;
    const inputScanner = new InputParser(inputData, " \n");

    // Read the number of nodes and edges from the input.
    const numNodes = inputScanner.nextInt();
    const numEdges = inputScanner.nextInt();

    // Declare arrays to store graph data, allowed paths, and memoized scores.
    let graphData = [];
    let allowedPaths = [];
    let memoizedScores = [];

    // Helper function to initialize an array of empty arrays for a given count.
    // This is used for graph-like structures where each index needs to hold an array.
    const initializeNestedArrays = (count) => {
        const newArray = [];
        for (let i = 0; i < count; i++) {
            newArray[i] = [];
        }
        return newArray;
    };

    // Initialize the graph data structures.
    // The original code initializes arrays only up to 'numNodes - 2' (i.e., for 'numNodes - 1' elements).
    // This means 'graphData[numNodes - 1]', 'allowedPaths[numNodes - 1]', and 'memoizedScores[numNodes - 1]'
    // will remain 'undefined'. This behavior is preserved to maintain exact observable behavior,
    // including potential runtime errors if an edge starts from node 'numNodes - 1'.
    graphData = initializeNestedArrays(numNodes - 1);
    allowedPaths = initializeNestedArrays(numNodes - 1);
    memoizedScores = initializeNestedArrays(numNodes - 1);

    // Read edge information and populate the graph structures.
    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const startNode = inputScanner.nextInt();
        const endNode = inputScanner.nextInt();
        const edgeWeight = inputScanner.nextInt();

        // Add the endNode to the list of allowed paths from the startNode.
        // If 'allowedPaths[startNode]' is 'undefined' (e.g., if 'startNode' is 'numNodes - 1'),
        // this line will throw a TypeError, replicating the original code's behavior.
        allowedPaths[startNode].push(endNode);
        // Assign the weight to the edge between startNode and endNode.
        // Similar to above, if 'graphData[startNode]' is 'undefined', this will throw.
        graphData[startNode][endNode] = edgeWeight;
    }

    // Start the DFS from node 0 with an initial score of 0 and depth 0,
    // and output the maximum score found.
    logOutput(calculateMaxScore(0, 0, 0, memoizedScores));
}

// InputParser (formerly Scanner) module definition
const InputParser = (function() {
    // Helper function for creating RangeError messages (local to InputParser)
    const createRangeError = (index) => new RangeError(`Index out of bounds at position '${index}'`);
    // Helper function for creating TypeError messages (local to InputParser)
    const createTypeError = (value) => new TypeError(`'${value}' cannot convert to Number`);

    // Constructor for the InputParser
    function InputParser(sourceString, tokenDelimiter) {
        // Create a regular expression from the delimiter string
        const delimiterRegex = new RegExp(tokenDelimiter.split("").join("|"), "g");
        this.currentIndex = 0; // Current position in the token list
        // Pre-process the input string: remove carriage returns and split by delimiter
        this.tokenList = sourceString.replace(/\r/g, '').split(delimiterRegex);
    }

    // Prototype methods for InputParser
    InputParser.prototype = {
        // Checks if there is a next token available.
        // Optionally, checks if the next token matches a specific value.
        hasNext: function(checkValue) {
            const currentToken = this.tokenList[this.currentIndex];
            if (typeof checkValue === "undefined") {
                // If no specific value is provided, check if the current token exists and is not empty.
                return typeof currentToken !== "undefined" && currentToken !== "";
            } else {
                // If a specific value is provided, check if the current token matches it.
                return currentToken === checkValue;
            }
        },
        // Retrieves the next token from the list and advances the index.
        next: function() {
            // The original code checks `this.list[this.idx + 1]`. This means it throws
            // if `this.currentIndex` points to the last element, preventing the last element
            // from being returned. This specific behavior is preserved.
            if (typeof this.tokenList[this.currentIndex + 1] === "undefined") {
                throw createRangeError(this.currentIndex);
            }
            return this.tokenList[this.currentIndex++];
        },
        // Retrieves the next token and attempts to convert it to a number.
        nextNumber: function() {
            const nextValueString = this.top(); // Peek at the next token string
            if (isNaN(+nextValueString)) { // Check if it can be converted to a number
                throw createTypeError(nextValueString);
            }
            return +this.next(); // Convert and return the actual next token as a number
        },
        // Retrieves the next token and converts it to an integer (base 10).
        nextInt: function(parseRadix) {
            parseRadix = parseRadix || 10; // Default radix to 10 if not specified.
            // The original code uses `parseInt(this.nextNumber(), radix)`.
            // `this.nextNumber()` already returns a number. `parseInt` on a number
            // first converts it to a string, then parses. For base 10, this is
            // equivalent to truncating the decimal part. `Math.trunc` provides
            // the same behavior for positive numbers and is a valid Type III modification.
            return Math.trunc(this.nextNumber());
        },
        // Peeks at the current token without advancing the index.
        top: function() {
            return this.tokenList[this.currentIndex];
        },
        // Resets the scanner's index to the beginning of the token list.
        rewind: function() {
            this.currentIndex = 0;
        }
    };

    return InputParser;
}());

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
