// Helper function to locate the canonical representative of a set within a Disjoint Set Union structure.
const retrieveRepresentative = (parentArrayRefs) => {
    // This inner function performs path compression during the find operation.
    return (elementIndex) => {
        // Basic validation for the element index (Type III addition).
        if (elementIndex < 0 || elementIndex >= parentArrayRefs.length) {
            // In a competitive programming context, this might be omitted for performance,
            // but for robust code, it's a valuable guard.
            // console.error("Error: Element index out of bounds in retrieveRepresentative.");
            return -1; // Return an invalid index or throw an error.
        }

        // If the element is not its own parent, it means it's not the root of its set.
        if (elementIndex !== parentArrayRefs[elementIndex]) {
            // Recursively find the true root of the parent's set and
            // directly attach the current element to that root (path compression).
            // Using a temporary variable for clarity (Type III addition).
            const ultimateRoot = retrieveRepresentative(parentArrayRefs)(parentArrayRefs[elementIndex]);
            parentArrayRefs[elementIndex] = ultimateRoot;
        }
        // Once the path is compressed, the current element's parent is its direct representative.
        return parentArrayRefs[elementIndex];
    };
};

// Secondary helper function to merge two sets based on their respective ranks.
const unifySetsByRank = (parentDataStore, rankDataStore) => {
    // This nested closure applies the union by rank heuristic to maintain a balanced tree structure.
    return (rootA, rootB) => {
        // If the two roots are already identical, they belong to the same set, so no union is needed.
        // This is a guard clause (Type III addition).
        if (rootA === rootB) {
            return;
        }

        // Retrieve the ranks of the two root elements.
        const rankOfRootA = rankDataStore[rootA];
        const rankOfRootB = rankDataStore[rootB];

        // Attach the tree with the smaller rank under the root of the tree with the larger rank.
        if (rankOfRootA > rankOfRootB) {
            parentDataStore[rootB] = rootA; // Root B becomes a child of Root A.
        } else {
            parentDataStore[rootA] = rootB; // Root A becomes a child of Root B.
            // If the ranks were equal, the rank of the new combined root increases by one.
            if (rankOfRootA === rankOfRootB) {
                rankDataStore[rootB]++; // Increment the rank of the new root (Root B in this case).
            }
        }
    };
};

// Main factory function to construct and return a Disjoint Set Union (DSU) data structure.
const createDisjointSetStructure = (initialCapacity) => {
    // Input validation for the initial size (Type III addition).
    if (typeof initialCapacity !== 'number' || initialCapacity < 0 || !Number.isInteger(initialCapacity)) {
        console.error("Error: Invalid initial capacity provided for DSU structure. Must be a non-negative integer.");
        return null; // Return null to indicate failure.
    }

    // Internal arrays to store parent pointers and ranks for each element.
    // Using local 'const' variables instead of 'this' to correctly manage scope and avoid global 'this' issues (Type III fix/rewrite).
    const parentReferences = Array(initialCapacity);
    const rankValues = Array(initialCapacity);

    // Initialize each element to be its own parent and have a rank of 0.
    // This ensures each element starts in its own distinct set.
    for (let currentIdx = 0; currentIdx < initialCapacity; ++currentIdx) {
        parentReferences[currentIdx] = currentIdx;
        rankValues[currentIdx] = 0;
    }

    // Bind the helper functions to these internal data arrays.
    const findOperation = retrieveRepresentative(parentReferences);
    const unionOperation = unifySetsByRank(parentReferences, rankValues);

    // Return an object exposing the public interface of the DSU structure.
    return {
        // Checks if two elements belong to the same set.
        areInSameSet: (elementOne, elementTwo) => {
            // Validate element indices before proceeding (Type III addition).
            if (elementOne < 0 || elementOne >= initialCapacity ||
                elementTwo < 0 || elementTwo >= initialCapacity) {
                // console.error("Invalid element index for 'areInSameSet'.");
                return false; // Assume not in same set if indices are invalid.
            }
            // Two elements are in the same set if their representatives are identical.
            return findOperation(elementOne) === findOperation(elementTwo);
        },

        // Merges the sets containing two given elements.
        mergeSets: (elementOne, elementTwo) => {
            // Validate element indices before proceeding (Type III addition).
            if (elementOne < 0 || elementOne >= initialCapacity ||
                elementTwo < 0 || elementTwo >= initialCapacity) {
                // console.error("Invalid element index for 'mergeSets'.");
                return; // Early exit for invalid input.
            }
            // Perform the union operation on the representatives of the two elements.
            unionOperation(findOperation(elementOne), findOperation(elementTwo));
        }
    };
};

// --- Main Program Execution Block ---

// Import the Node.js 'fs' (file system) module for reading input.
const fileSystemModule = require('fs');

// Read all input from standard input ('/dev/stdin') as a UTF-8 string.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the input content into individual lines and filter out any empty lines (Type III addition).
const processedInputLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

// Extract the first line, which should contain the initial number of elements and queries.
const initialConfigParts = processedInputLines.shift().split(' ');

// Parse the number of elements and queries. Using parseInt with radix 10 (Type III rewrite).
const totalElementsCount = parseInt(initialConfigParts[0], 10);
const totalQueryCount = parseInt(initialConfigParts[1], 10); // Variable `q` renamed and type conversion explicit.

// Initialize the Disjoint Set Union data structure with the specified number of elements.
const dsuService = createDisjointSetStructure(totalElementsCount);

// Check if the DSU structure was successfully initialized (Type III addition).
if (!dsuService) {
    console.error("Program halted: DSU structure could not be initialized due to invalid parameters.");
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Iterate over each remaining line, processing it as a query.
processedInputLines.forEach((currentQueryLine, lineIdx) => {
    // Skip empty lines that might have slipped through or appeared at the end (Type III addition).
    if (!currentQueryLine.trim()) {
        return;
    }

    const queryParameters = currentQueryLine.split(' ');

    // Basic validation to ensure the query line has enough parts (Type III addition).
    if (queryParameters.length < 3) {
        // console.warn(`Warning: Malformed query line encountered at index ${lineIdx}. Skipping.`);
        return;
    }

    // Parse the operation type and the two element parameters.
    const operationCode = parseInt(queryParameters[0], 10);
    const firstOperand = parseInt(queryParameters[1], 10);
    const secondOperand = parseInt(queryParameters[2], 10);

    // Execute the appropriate DSU operation based on the operation code.
    switch (operationCode) {
        case 0: // Represents a union operation.
            dsuService.mergeSets(firstOperand, secondOperand);
            break;
        case 1: // Represents a "same set" check operation.
            const areNodesConnected = dsuService.areInSameSet(firstOperand, secondOperand);
            // Output 1 if connected, 0 otherwise.
            const connectionStatusIndicator = areNodesConnected ? 1 : 0;
            console.log(connectionStatusIndicator);
            break;
        default: // Handle unknown operation types (Type III addition).
            // console.warn(`Notice: Encountered an unrecognized operation code '${operationCode}' on line ${lineIdx}. Skipping this query.`);
            break;
    }
});