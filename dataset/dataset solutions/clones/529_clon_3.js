// --- Global Constants and Enums for Clarity ---

/**
 * Enumeration for the type of comparison operator in a constraint.
 * - LESS_EQUAL: Represents '<='
 * - GREATER_EQUAL: Represents '>='
 * - SPECIAL_MUL: Represents '*' (often treated as a special conditional case)
 */
const COMPARISON_TYPE = {
    LESS_EQUAL: 0,
    GREATER_EQUAL: 1,
    SPECIAL_MUL: 2
};

/**
 * Enumeration for the arithmetic sign operator in a constraint.
 * - PLUS: Represents '+'
 * - MINUS: Represents '-'
 */
const ARITHMETIC_SIGN = {
    PLUS: 0,
    MINUS: 1
};

/**
 * Class representing a directed edge in the graph for Bellman-Ford algorithm.
 * Using an object/class improves readability over raw arrays [source, destination, weight].
 */
class GraphEdge {
    /**
     * @param {number} source - The starting node index (0-based).
     * @param {number} destination - The ending node index (0-based).
     * @param {number} weight - The weight/cost associated with traversing this edge.
     */
    constructor(source, destination, weight) {
        this.source = source;
        this.destination = destination;
        this.weight = weight;
    }

    /**
     * Provides a string representation of the edge for debugging purposes.
     * @returns {string}
     */
    toString() {
        return `Edge(${this.source} -> ${this.destination}, W:${this.weight})`;
    }
}

/**
 * Parses a single constraint string from the input.
 * It extracts the two node identifiers, the constant value, and the types of operators.
 *
 * @param {string} constraintLine The raw string input representing a constraint (e.g., "1 <= 2 + 3").
 * @returns {object|null} An object containing `node1`, `node2` (0-indexed), `value`, `comparisonType`, and `arithmeticSign`,
 *                        or `null` if the parsing fails due to an unexpected format.
 */
function parseConstraintString(constraintLine) {
    // Regular expression to meticulously capture all parts of the constraint line.
    // Group 1: First number (Node A)
    // Group 2: Comparison operator (<=, >=, *)
    // Group 3: Second number (Node B)
    // Group 4: Arithmetic operator (+, -)
    // Group 5: Third number (Constant C)
    const matchResult = constraintLine.match(/^(\d+)\s*(<=|>=|\*)\s*(\d+)\s*([+\-])\s*(\d+)$/);

    if (!matchResult) {
        // If the regex doesn't match, the input format is unexpected.
        // In a real application, this might throw an error or log a warning.
        // For competitive programming, we often assume valid input or handle edge cases minimally.
        return null;
    }

    // Destructure the captured groups from the regex match.
    // The first element of matchResult is the full matched string, so we skip it.
    const [, node1Str, compOpStr, node2Str, valueStr, arithOpStr] = matchResult; // Corrected order of valueStr and arithOpStr

    // Convert string-captured numbers to actual numbers and adjust node indices to be 0-based.
    const node1 = Number(node1Str) - 1;
    const node2 = Number(node2Str) - 1;
    const value = Number(valueStr);

    // Determine the comparison operator type using the defined constants.
    let comparisonType;
    switch (compOpStr) {
        case '<=': comparisonType = COMPARISON_TYPE.LESS_EQUAL; break;
        case '>=': comparisonType = COMPARISON_TYPE.GREATER_EQUAL; break;
        case '*': comparisonType = COMPARISON_TYPE.SPECIAL_MUL; break;
        default: return null; // Should ideally not be reached if regex is robust.
    }

    // Determine the arithmetic sign operator type.
    let arithmeticSign;
    switch (arithOpStr) {
        case '+': arithmeticSign = ARITHMETIC_SIGN.PLUS; break;
        case '-': arithmeticSign = ARITHMETIC_SIGN.MINUS; break;
        default: return null; // Should not be reached.
    }

    return { node1, node2, value, comparisonType, arithmeticSign };
}

/**
 * The primary function that orchestrates the problem-solving logic.
 * This function reads input, processes constraints, runs Bellman-Ford, and outputs the result.
 * @returns {void}
 */
function executeGraphSolver() {
    // Read the total number of nodes in the graph and the number of constraints.
    const numNodes = readInputToken();
    const numConstraints = readInputToken();

    // Basic input validation. If node count is non-positive or constraint count is negative,
    // it implies an invalid problem instance.
    if (numNodes <= 0 || numConstraints < 0) {
        outputResult(-1); // Output -1 for invalid input.
        return;
    }

    // `fixedEdges` stores constraints that are always part of the graph.
    const fixedEdges = [];
    // `conditionalDecisionEdges` stores constraints where one of two possible edges must be chosen.
    // Each element is an array of two GraphEdge objects.
    const conditionalDecisionEdges = [];

    // Loop through each constraint line to parse and transform it into graph edges.
    for (let i = 0; i < numConstraints; ++i) {
        const currentConstraintLine = readInputToken('string');
        const parsedConstraint = parseConstraintString(currentConstraintLine);

        // If parsing failed for any reason, skip this line.
        // In a production environment, more robust error handling would be needed.
        if (!parsedConstraint) {
            continue;
        }

        const { node1, node2, value, comparisonType, arithmeticSign } = parsedConstraint;

        // Apply specific transformations based on the original problem's interpretation
        // of inequalities into Bellman-Ford compatible edges (dist[v] <= dist[u] + weight).

        if (comparisonType === COMPARISON_TYPE.LESS_EQUAL) {
            // Case: `node1 <= node2 + value` OR `node1 <= node2 - value`
            if (arithmeticSign === ARITHMETIC_SIGN.PLUS) {
                // Original: A <= B + C -> e.push([B, A, -C]);
                // This implies dist[A] <= dist[B] - C, which is not a direct translation of A <= B + C.
                // We adhere to the original's transformation.
                fixedEdges.push(new GraphEdge(node2, node1, -value));
            } else { // arithmeticSign === ARITHMETIC_SIGN.MINUS
                // Original: A <= B - C -> e.push([B, A, 0]); e.push([A, B, C]);
                // This implies dist[A] <= dist[B] + 0 AND dist[B] <= dist[A] + C.
                // These two edges together can represent some forms of equality or bounded difference.
                fixedEdges.push(new GraphEdge(node2, node1, 0));
                fixedEdges.push(new GraphEdge(node1, node2, value));
            }
        } else if (comparisonType === COMPARISON_TYPE.GREATER_EQUAL) {
            // Case: `node1 >= node2 + value` OR `node1 >= node2 - value`
            if (arithmeticSign === ARITHMETIC_SIGN.PLUS) {
                // Original: A >= B + C -> e.push([A, B, -C]);
                // This implies dist[B] <= dist[A] - C.
                fixedEdges.push(new GraphEdge(node1, node2, -value));
            } else { // arithmeticSign === ARITHMETIC_SIGN.MINUS
                // Original: A >= B - C -> e.push([B, A, C]); e.push([A, B, 0]);
                // This implies dist[A] <= dist[B] + C AND dist[B] <= dist[A] + 0.
                fixedEdges.push(new GraphEdge(node2, node1, value));
                fixedEdges.push(new GraphEdge(node1, node2, 0));
            }
        } else { // comparisonType === COMPARISON_TYPE.SPECIAL_MUL (for '*')
            // Case: `node1 * node2 + value` OR `node1 * node2 - value`
            // The '*' operator is treated as a special case, sometimes conditional, sometimes fixed.
            if (arithmeticSign === ARITHMETIC_SIGN.PLUS) {
                // Original: A * B + C -> f.push([[A, B, -C], [B, A, -C]]);
                // This creates a choice: (dist[B] <= dist[A] - C) OR (dist[A] <= dist[B] - C).
                conditionalDecisionEdges.push([
                    new GraphEdge(node1, node2, -value),
                    new GraphEdge(node2, node1, -value)
                ]);
            } else { // arithmeticSign === ARITHMETIC_SIGN.MINUS
                // Original: A * B - C -> e.push([B, A, C]); e.push([A, B, C]);
                // This implies dist[A] <= dist[B] + C AND dist[B] <= dist[A] + C.
                // Effectively, dist[A] and dist[B] are equal or very close, bounded by C.
                fixedEdges.push(new GraphEdge(node2, node1, value));
                fixedEdges.push(new GraphEdge(node1, node2, value));
            }
        }
    } // End of constraint processing loop

    let ultimateBestDistance = -Infinity; // Stores the maximum distance found across all combinations.

    // The number of decision edges determines how many combinations we need to check.
    // If there are `k` decision edges, there are `2^k` combinations.
    const numberOfDecisionOptions = conditionalDecisionEdges.length;
    const totalCombinations = 1 << numberOfDecisionOptions; // Equivalent to 2^numberOfDecisionOptions.

    // Iterate through every possible combination of choices for the conditional edges.
    for (let combinationMask = 0; combinationMask < totalCombinations; ++combinationMask) {
        // Create a new set of edges for the current combination.
        // Start with all fixed edges. Using spread operator for a shallow copy.
        const currentActiveEdges = [...fixedEdges];

        // Add the chosen option from each conditional constraint based on the `combinationMask`.
        for (let j = 0; j < numberOfDecisionOptions; ++j) {
            // The j-th bit of `combinationMask` (0 or 1) selects which edge option to take.
            const chosenOptionIndex = (combinationMask >> j) & 1;
            currentActiveEdges.push(conditionalDecisionEdges[j][chosenOptionIndex]);
        }

        // --- Bellman-Ford Algorithm Execution ---
        // Initialize distances: `distances[i]` stores the shortest path from node 0 to node `i`.
        const distances = new Array(numNodes).fill(Infinity);
        distances[0] = 0; // The distance from the source node (node 0) to itself is 0.

        // Bellman-Ford iterations. `numNodes` iterations are performed.
        // After `numNodes - 1` iterations, shortest paths are found if no negative cycles.
        // The `numNodes`-th iteration is used to detect negative cycles.
        for (let k = 0; k < numNodes; ++k) {
            let anyDistanceChangedInIteration = false; // Flag to track if any distance was updated.

            // Iterate over all edges to perform relaxation.
            for (const edge of currentActiveEdges) {
                // If the source node is unreachable, this edge cannot relax any other node.
                if (distances[edge.source] === Infinity) {
                    continue;
                }

                // Relaxation step: if a shorter path to `edge.destination` is found via `edge.source`.
                if (distances[edge.source] + edge.weight < distances[edge.destination]) {
                    distances[edge.destination] = distances[edge.source] + edge.weight;
                    anyDistanceChangedInIteration = true;
                }
            }

            // Optimization: If no distances were updated in an entire iteration,
            // it means the shortest paths are stable, and further iterations won't change anything.
            // We can break early, unless it's the very last iteration which is for negative cycle detection.
            if (!anyDistanceChangedInIteration && k < numNodes - 1) {
                break;
            }
        }

        // After `numNodes` iterations, check for negative cycles.
        // The problem's specific condition for a valid solution is `distances[0] >= 0`.
        // If `distances[0]` is negative, it implies a negative cycle reachable from node 0
        // that allows the distance to node 0 itself to become negative.
        if (distances[0] >= 0) {
            // If no problematic negative cycle, update the maximum distance found to the target node (`numNodes - 1`).
            ultimateBestDistance = Math.max(ultimateBestDistance, distances[numNodes - 1]);
        }
    } // End of combination loop

    // Output the final computed result based on `ultimateBestDistance`.
    if (ultimateBestDistance === Infinity) {
        outputResult('inf'); // Indicates target node can be infinitely far.
    } else if (ultimateBestDistance === -Infinity) {
        outputResult(-1); // Indicates no feasible path or no valid solution found across any combination.
    } else {
        outputResult(ultimateBestDistance); // Output the calculated maximum shortest distance.
    }
}

// --- Standard Input/Output Utility Functions ---

// Ensure the standard input stream remains open for reading.
process.stdin.resume();
// Set the encoding for incoming data to UTF-8 text.
process.stdin.setEncoding('utf8');

// A buffer to accumulate all incoming data from standard input.
let fullInputBuffer = '';
// An array to store the input tokens after splitting and cleaning.
let preprocessedInputTokens = [];
// An index to keep track of which token is next to be read.
let currentTokenReadIndex = 0;

/**
 * Reads and returns the next token from the pre-processed input array.
 * @param {string} [returnFormat] Optional. If 'string', the token is returned as a string.
 *                                Otherwise, it's converted to a number.
 * @returns {string|number} The next token from the input.
 */
function readInputToken(returnFormat) {
    // Check for end-of-input condition.
    if (currentTokenReadIndex >= preprocessedInputTokens.length) {
        // Return a default value or handle as an error if attempting to read past input.
        return returnFormat === 'string' ? '' : 0;
    }
    const token = preprocessedInputTokens[currentTokenReadIndex++];
    return returnFormat === 'string' ? token : Number(token);
}

/**
 * Writes the given value to standard output, followed by a newline character.
 * @param {*} valueToPrint The value to be displayed.
 */
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

// Event listener: Appends each incoming chunk of data to the `fullInputBuffer`.
process.stdin.on('data', (dataChunk) => {
    fullInputBuffer += dataChunk;
});

// Event listener: Triggered when the entire standard input stream has ended.
process.stdin.on('end', () => {
    // Split the accumulated input buffer by any whitespace characters (spaces, newlines, tabs).
    // `filter(Boolean)` removes any empty strings that might result from multiple spaces.
    preprocessedInputTokens = fullInputBuffer.split(/\s+/).filter(Boolean);
    // Once all input is parsed into tokens, initiate the main solver routine.
    executeGraphSolver();
});