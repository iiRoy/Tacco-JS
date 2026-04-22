// This section handles input processing and output display.
// It uses Node.js standard input/output streams for interactive console applications.

// Ensure the standard input stream remains open to receive data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// A global string to accumulate all chunks of input data received.
let rawInputData = '';
// A pointer to keep track of the current position when reading tokens from rawInputData.
let inputTokenIndex = 0;

/**
 * Retrieves and parses the next token from the accumulated input data.
 * Advances the internal pointer after reading a token.
 * @param {string} [desiredParsedType='number'] - Specifies the desired type for the token ('number' or 'string').
 *                                                  Defaults to 'number'.
 * @returns {number|string} The parsed token, either as a number or a string.
 * @throws {Error} If an attempt is made to read beyond the available input tokens.
 */
function retrieveNextInputToken(desiredParsedType = 'number') {
    // Implement a guard clause to prevent out-of-bounds access.
    if (inputTokenIndex >= rawInputData.length) {
        throw new Error("Input buffer exhausted: No more tokens available to read.");
    }

    const currentInputSegment = rawInputData[inputTokenIndex];
    inputTokenIndex += 1; // Increment the pointer for the subsequent read.

    // Conditional parsing based on the desired type.
    if (desiredParsedType === 'string') {
        return currentInputSegment;
    } else {
        // Attempt to convert the segment to a number by default.
        return Number(currentInputSegment);
    }
}

/**
 * Displays a given value to the standard output (console).
 * This function is a simple wrapper for console.log, allowing for potential future modifications
 * like adding prefixes or logging to a file.
 * @param {*} valueToDisplay - The value (can be any type) to be printed.
 */
function displayOutput(valueToDisplay) {
    console.log(valueToDisplay);
}

// Event listener for the 'data' event on the standard input stream.
// Each time a chunk of data arrives, it's appended to `rawInputData`.
process.stdin.on('data', function(incomingDataChunk) {
    rawInputData += incomingDataChunk;
});

// Event listener for the 'end' event on the standard input stream.
// Once all input has been received, this function processes it and starts the main program logic.
process.stdin.on('end', function() {
    // Split the entire accumulated input string by any whitespace character(s).
    // The `.filter(Boolean)` part removes any empty strings that might result from multiple spaces.
    rawInputData = rawInputData.split(/\s+/).filter(Boolean);
    initiateApplicationWorkflow(); // Call the renamed main function to begin processing.
});


// --- Disjoint Set Union (DSU) Structure Definition ---

/**
 * Implements a Disjoint Set Union (DSU) data structure, also widely known as Union-Find.
 * This structure is optimized for efficiently managing collections of disjoint sets
 * and performing two primary operations: finding the representative of an element's set
 * and uniting two sets.
 */
class DisjointSetCollection {
    // Private fields to encapsulate the internal state of the DSU.
    #parentLinks;       // Stores the parent of each element. For a root, it points to itself.
    #setRanks;          // Stores the 'rank' (or height/size) of the tree rooted at each element.
    #totalManagedElements; // The total count of elements being managed by this DSU instance.

    /**
     * Initializes a new DisjointSetCollection instance.
     * Each element is initially placed in its own distinct set.
     * @param {number} countOfElements - The total number of elements (typically 0-indexed)
     *                                   this DSU structure will manage.
     */
    constructor(countOfElements) {
        // Add a guard clause for invalid input for element count.
        if (countOfElements <= 0) {
            displayOutput("Warning: DSU initialized with zero or negative elements. Operations may not be valid.");
            this.#totalManagedElements = 0;
            this.#parentLinks = [];
            this.#setRanks = [];
            return;
        }

        this.#totalManagedElements = countOfElements;
        this.#parentLinks = new Array(this.#totalManagedElements);
        // Initialize all ranks to zero. This is used for the union-by-rank optimization.
        this.#setRanks = new Array(this.#totalManagedElements).fill(0);

        // Populate the parent array: initially, each element is its own parent.
        this._setupInitialSets();
        // displayOutput(`Debug: DSU instance created for ${this.#totalManagedElements} entities.`); // New fragment (debug output)
    }

    /**
     * Private helper method to set up the initial state where every element is a root of its own set.
     */
    _setupInitialSets() {
        for (let currentEntityIndex = 0; currentEntityIndex < this.#totalManagedElements; currentEntityIndex++) {
            this.#parentLinks[currentEntityIndex] = currentEntityIndex;
        }
    }

    /**
     * Determines the canonical representative (root) of the set to which a given element belongs.
     * This method employs path compression to flatten the tree structure,
     * making subsequent `find` operations faster.
     * @param {number} entityIdentifier - The identifier of the element (0-indexed).
     * @returns {number} The identifier of the root element of the set.
     * @throws {Error} If the provided `entityIdentifier` is outside the valid range.
     */
    findSetRepresentative(entityIdentifier) {
        // Validate the input element identifier to prevent array access errors.
        if (entityIdentifier < 0 || entityIdentifier >= this.#totalManagedElements) {
            throw new Error(`Invalid entity identifier: ${entityIdentifier}. It must be within [0, ${this.#totalManagedElements - 1}].`);
        }

        // Base case: If an element's parent is itself, it is the root of its set.
        if (this.#parentLinks[entityIdentifier] === entityIdentifier) {
            return entityIdentifier;
        }

        // Recursive step with path compression:
        // Find the root of the parent, then directly link the current element to that root.
        const actualRoot = this.findSetRepresentative(this.#parentLinks[entityIdentifier]);
        this.#parentLinks[entityIdentifier] = actualRoot; // Path compression in action.
        return actualRoot;
    }

    /**
     * Checks whether two specified elements belong to the same disjoint set.
     * @param {number} firstEntity - The identifier of the first element.
     * @param {number} secondEntity - The identifier of the second element.
     * @returns {boolean} `true` if both elements are in the same set, `false` otherwise.
     */
    areEntitiesConnected(firstEntity, secondEntity) {
        // Optimization: If the entities are identical, they are trivially connected.
        if (firstEntity === secondEntity) {
            return true;
        }
        // They are connected if their set representatives are the same.
        return this.findSetRepresentative(firstEntity) === this.findSetRepresentative(secondEntity);
    }

    /**
     * Merges (unites) the two sets that contain the given elements.
     * This operation uses the union-by-rank heuristic to maintain a balanced tree structure,
     * which helps to keep the DSU operations efficient.
     * @param {number} entityA - The identifier of the first element.
     * @param {number} entityB - The identifier of the second element.
     */
    uniteTwoSets(entityA, entityB) {
        const rootOfA = this.findSetRepresentative(entityA);
        const rootOfB = this.findSetRepresentative(entityB);

        // If the elements are already in the same set, no merge is needed.
        if (rootOfA === rootOfB) {
            // displayOutput(`Debug: Entities ${entityA} and ${entityB} already share a set.`); // New fragment (debug output)
            return;
        }

        // Retrieve ranks for union-by-rank optimization.
        const rankValueA = this.#setRanks[rootOfA]; // Use intermediate variable.
        const rankValueB = this.#setRanks[rootOfB];

        // Attach the tree with the smaller rank under the root of the tree with the larger rank.
        // This keeps the overall tree flatter.
        if (rankValueA > rankValueB) {
            this.#parentLinks[rootOfB] = rootOfA;
        } else if (rankValueB > rankValueA) {
            this.#parentLinks[rootOfA] = rootOfB;
        } else {
            // If ranks are equal, pick one root (e.g., rootOfA) to be the parent of the other (rootOfB),
            // and increment the rank of the new parent (rootOfA).
            this.#parentLinks[rootOfA] = rootOfB;
            this.#setRanks[rootOfB] = this.#setRanks[rootOfB] + 1; // Explicit addition instead of '++'.
        }
    }
}


/**
 * The main entry point function that coordinates the application's logic.
 * It reads initial configuration, sets up the DSU, and processes a series of queries.
 */
function initiateApplicationWorkflow() {
    // Read the initial total number of elements that the DSU will manage.
    const elementCountForDSU = retrieveNextInputToken();

    // Guard clause: Validate that the number of elements is positive.
    if (elementCountForDSU <= 0) {
        displayOutput("Error: The initial number of elements must be a positive integer.");
        return; // Exit if invalid setup.
    }

    // Create an instance of our Disjoint Set Union structure.
    const activeDSUManager = new DisjointSetCollection(elementCountForDSU);

    // Read the total count of operations (queries) to be performed.
    const totalQueryOperations = retrieveNextInputToken();

    // Guard clause: Validate that the number of queries is non-negative.
    if (totalQueryOperations < 0) {
        displayOutput("Error: The number of queries cannot be negative.");
        return; // Exit if invalid query count.
    }

    // Iterate through each query operation.
    // Replaced the custom `rep` function with a standard `for` loop.
    for (let currentOperationIdx = 0; currentOperationIdx < totalQueryOperations; ++currentOperationIdx) {
        const operationType = retrieveNextInputToken(); // 0 for unite, 1 for connection check.
        const firstOperand = retrieveNextInputToken();
        const secondOperand = retrieveNextInputToken();

        // Employ a switch statement for handling different query types,
        // which is an update from the original if/else structure.
        switch (operationType) {
            case 0: // Case for a "unite" operation.
                // displayOutput(`Debug: Executing unite operation for ${firstOperand} and ${secondOperand}.`); // New fragment (debug output)
                activeDSUManager.uniteTwoSets(firstOperand, secondOperand);
                break;
            case 1: // Case for a "check connection" operation.
                const areTheyCurrentlyConnected = activeDSUManager.areEntitiesConnected(firstOperand, secondOperand);
                // Convert the boolean result to a number (1 for true, 0 for false)
                // to match the original problem's output format.
                displayOutput(Number(areTheyCurrentlyConnected));
                break;
            default:
                // New fragment: Handle unrecognized query types gracefully.
                displayOutput(`Warning: Unrecognized operation type '${operationType}' encountered. Skipping this query.`);
                break;
        }
    }
    // displayOutput("Debug: All scheduled queries have been processed."); // New fragment (debug output)
}