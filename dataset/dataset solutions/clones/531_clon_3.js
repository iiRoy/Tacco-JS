let rawDataBuffer = '';
let bufferReadPointer = 0;

const INITIAL_DIST_VALUE = Number.POSITIVE_INFINITY;
const INVALID_RESULT_NEG = -1;
const INVALID_RESULT_INF = 'inf';

/**
 * Acquires the next token from the input buffer.
 * Attempts to parse as a number by default, or returns as string.
 * @param {string} [dataType='number'] - 'number' or 'string'.
 * @returns {number|string} The parsed value.
 * @throws {Error} If attempting to read past the end of the input or parsing fails.
 */
function acquireInputToken(dataType = 'number') {
    if (bufferReadPointer >= rawDataBuffer.length) {
        throw new Error("Input buffer exhausted. Attempted to read past end of input.");
    }
    const token = rawDataBuffer[bufferReadPointer++];
    if (dataType === 'string') {
        return token;
    } else {
        const parsedNum = parseInt(token, 10);
        if (isNaN(parsedNum)) {
            console.error(`Warning: Failed to parse number from token: '${token}'. Returning NaN.`);
            // For robustness, might throw an error here or handle specifically.
            // For cloning, matching original behavior of `+token` which results in NaN if not a number.
            return NaN;
        }
        return parsedNum;
    }
}

/**
 * Displays the final result to the console.
 * @param {string|number} valueToOutput - The value to be printed.
 */
function displayResult(valueToOutput) {
    console.log(valueToOutput);
}

/**
 * Iterates a function over a specified range.
 * Mimics the original `rep` function's overloaded behavior.
 * @param {number} arg1 - If two arguments, this is `end`. If three, this is `start`.
 * @param {number|function} arg2 - If two arguments, this is `callbackFn`. If three, this is `end`.
 * @param {function} [arg3] - The callback function for three arguments.
 * @throws {Error} If arguments are invalid.
 */
function loopRange(arg1, arg2, arg3) {
    let loopStart = 0;
    let loopEnd;
    let iterationCallback;

    if (arg3 === undefined && typeof arg2 === 'function') {
        // Signature: (end, callback)
        loopEnd = arg1;
        iterationCallback = arg2;
    } else if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'function') {
        // Signature: (start, end, callback)
        loopStart = arg1;
        loopEnd = arg2;
        iterationCallback = arg3;
    } else {
        throw new Error("Invalid arguments for loopRange. Expected (end, callback) or (start, end, callback).");
    }

    for (let currentIdx = loopStart; currentIdx < loopEnd; ++currentIdx) {
        iterationCallback(currentIdx);
    }
}

/**
 * Main function to process the constraint system and find the optimal value.
 * Implements a Bellman-Ford-like algorithm on difference constraints.
 */
function processConstraintSystem() {
    // Acquire problem dimensions from input
    const variableCount = acquireInputToken(); // Renamed 'n'
    const constraintCount = acquireInputToken(); // Renamed 'm'

    // Data structures for storing graph edges
    // Stores direct linear inequalities (e.g., A <= B + C)
    const linearInequalities = []; // Renamed 'e'
    // Stores conditional constraints (e.g., A <= B + C OR B <= A + D)
    const conditionalConstraints = []; // Renamed 'f'

    /**
     * Helper to add a single directed edge to the linearInequalities array.
     * Represents a constraint `dist[target] <= dist[source] + weight`.
     * @param {number} from - Source node index.
     * @param {number} to - Target node index.
     * @param {number} weight - Edge weight.
     */
    const addLinearEdge = (from, to, weight) => {
        linearInequalities.push([from, to, weight]);
    };

    /**
     * Helper to add a pair of edges representing a conditional constraint.
     * @param {Array<number>} edge1 - The first edge option.
     * @param {Array<number>} edge2 - The second edge option.
     */
    const createConditionalEdgePair = (edge1, edge2) => {
        conditionalConstraints.push([edge1, edge2]);
    };

    // Process each constraint string from input
    loopRange(constraintCount, () => {
        const expressionText = acquireInputToken('string'); // Renamed 's'

        // Parse numerical components from the expression string
        const expressionParts = expressionText.split(/<=|>=|\*|\+|-/);

        // Convert string parts to numbers and adjust for 0-indexing
        // Original code: p[0] = +p[0] - 1; p[1] = +p[1] - 1; p[2] = +p[2];
        const firstVarIdx = parseInt(expressionParts[0], 10) - 1;
        const secondVarIdx = parseInt(expressionParts[1], 10) - 1;
        const constantValue = parseInt(expressionParts[2], 10);

        // Basic validation for parsed numerical components
        if (isNaN(firstVarIdx) || isNaN(secondVarIdx) || isNaN(constantValue)) {
            console.warn(`Skipping malformed constraint: '${expressionText}'. Contains non-numeric parts.`);
            return; // Skip this constraint
        }

        // Determine the relational operator category (<=, >=, or *)
        // Original 'u': 2 for '*', 0 for '<=', 1 for '>='
        let relationalOperatorCategory;
        if (expressionText.includes('*')) {
            relationalOperatorCategory = 2; // Represents equality or disjunction
        } else if (expressionText.includes('<=')) {
            relationalOperatorCategory = 0; // Less than or equal to
        } else if (expressionText.includes('>=')) {
            relationalOperatorCategory = 1; // Greater than or equal to
        } else {
            console.warn(`Unrecognized relational operator in constraint: '${expressionText}'. Skipping.`);
            return;
        }

        // Determine the additive operator category (+ or implied -)
        // Original 'v': 0 if '+' is present, 1 if '+' is absent (implies '-')
        const additiveOperatorCategory = expressionText.includes('+') ? 0 : 1;

        // Construct graph edges based on the categorized constraint type
        switch (relationalOperatorCategory) {
            case 0: // Original 'u == 0' (corresponds to '<=')
                if (additiveOperatorCategory === 0) { // Original 'v == 0' (corresponds to '+')
                    // Constraint: `X <= Y + C`. Original code adds: `[Y, X, -C]`
                    // This models: `X - Y <= -C` which is `X <= Y - C`.
                    // The original code's interpretation of `+` flips the sign of `C`.
                    addLinearEdge(secondVarIdx, firstVarIdx, -constantValue);
                } else { // Original 'v == 1' (corresponds to 'no +', implying '-')
                    // Constraint: `X <= Y - C`. Original code adds: `[Y, X, 0]` and `[X, Y, C]`
                    // This models: `X - Y <= 0` (i.e., `X <= Y`) AND `Y - X <= C` (i.e., `Y <= X + C`).
                    addLinearEdge(secondVarIdx, firstVarIdx, 0);
                    addLinearEdge(firstVarIdx, secondVarIdx, constantValue);
                }
                break;

            case 1: // Original 'u == 1' (corresponds to '>=')
                if (additiveOperatorCategory === 0) { // Original 'v == 0' (corresponds to '+')
                    // Constraint: `X >= Y + C`. Original code adds: `[X, Y, -C]`
                    // This models: `Y - X <= -C` which is `Y <= X - C`.
                    addLinearEdge(firstVarIdx, secondVarIdx, -constantValue);
                } else { // Original 'v == 1' (corresponds to 'no +', implying '-')
                    // Constraint: `X >= Y - C`. Original code adds: `[Y, X, C]` and `[X, Y, 0]`
                    // This models: `X - Y <= C` (i.e., `X <= Y + C`) AND `Y - X <= 0` (i.e., `Y <= X`).
                    addLinearEdge(secondVarIdx, firstVarIdx, constantValue);
                    addLinearEdge(firstVarIdx, secondVarIdx, 0);
                }
                break;

            case 2: // Original 'u == 2' (corresponds to '*')
                if (additiveOperatorCategory === 0) { // Original 'v == 0' (corresponds to '+')
                    // Constraint: `X * Y + C`. Original code adds conditional: `[[X, Y, -C], [Y, X, -C]]`
                    // This models: (`Y - X <= -C` i.e., `Y <= X - C`) OR (`X - Y <= -C` i.e., `X <= Y - C`).
                    createConditionalEdgePair(
                        [firstVarIdx, secondVarIdx, -constantValue],
                        [secondVarIdx, firstVarIdx, -constantValue]
                    );
                } else { // Original 'v == 1' (corresponds to 'no +', implying '-')
                    // Constraint: `X * Y - C`. Original code adds: `[Y, X, C]` and `[X, Y, C]`
                    // This models: `X - Y <= C` (i.e., `X <= Y + C`) AND `Y - X <= C` (i.e., `Y <= X + C`).
                    // This effectively means `|X - Y| <= C`.
                    addLinearEdge(secondVarIdx, firstVarIdx, constantValue);
                    addLinearEdge(firstVarIdx, secondVarIdx, constantValue);
                }
                break;

            default:
                // This case should ideally not be reached if operator parsing is exhaustive.
                console.warn(`Unhandled relational operator category: ${relationalOperatorCategory} for constraint: '${expressionText}'.`);
                break;
        }
    });

    // Add implicit non-negativity constraint for all variables relative to a dummy node 0.
    // The constraint is `v_i >= 0`, which translates to `0 - v_i <= 0` or `v_i - 0 <= 0`.
    // Original code: `e[e.length] = [i, 0, 0];` which means `dist[0] <= dist[i] + 0`.
    // This implies `dist[0]` is a lower bound for all `dist[i]`. If `dist[0]` is initialized to 0,
    // this means `0 <= dist[i]`, i.e., `dist[i] >= 0`.
    loopRange(variableCount, (idx) => {
        addLinearEdge(idx, 0, 0); // Ensures all variables are non-negative relative to node 0.
    });

    // Initialize the maximum possible value found for the target variable (variableCount - 1)
    let optimalValue = Number.NEGATIVE_INFINITY; // Renamed 'ans'

    // Iterate through all 2^k combinations of conditional constraints
    // Each combination represents selecting one branch from each `conditionalConstraints` pair.
    const numCombinations = 1 << conditionalConstraints.length;
    loopRange(numCombinations, (combinationIndex) => { // Renamed 'comb'
        // Create a temporary graph for the current combination of edges
        const activeEdges = [...linearInequalities]; // Renamed 'g', shallow copy of base edges

        // Add the specific edges chosen for this combination from conditional constraints
        loopRange(conditionalConstraints.length, (condIdx) => {
            const selectedBranch = (combinationIndex >> condIdx) & 1; // 0 or 1
            activeEdges.push(conditionalConstraints[condIdx][selectedBranch]);
        });

        // Initialize distances for the Bellman-Ford algorithm
        const pathDistances = Array(variableCount).fill(INITIAL_DIST_VALUE); // Renamed 'd'
        pathDistances[0] = 0; // The dummy source node (node 0) has a distance of 0

        // Execute Bellman-Ford algorithm
        // Perform `variableCount` iterations. `V-1` iterations find shortest paths,
        // the `V`-th iteration checks for negative cycles.
        for (let iterationNum = 0; iterationNum < variableCount; iterationNum++) {
            let distancesUpdatedInIteration = false; // Flag to track if any distance changed

            for (const currentEdge of activeEdges) { // Renamed 'edge' to 'currentEdge'
                const sourceNode = currentEdge[0];
                const targetNode = currentEdge[1];
                const edgeWeight = currentEdge[2];

                // Relax the edge: `dist[target] <= dist[source] + weight`
                // Only relax if the source node is reachable (its distance is not infinity)
                if (pathDistances[sourceNode] !== INITIAL_DIST_VALUE) {
                    const candidateDistance = pathDistances[sourceNode] + edgeWeight;
                    if (candidateDistance < pathDistances[targetNode]) {
                        pathDistances[targetNode] = candidateDistance;
                        distancesUpdatedInIteration = true;
                    }
                }
            }
            // Optimization: If no distances were updated in an entire iteration,
            // no further updates will occur, so we can break early.
            // This is valid unless we are specifically looking for negative cycles in the last iteration.
            // For this problem, the check `pathDistances[0] >= 0` implicitly handles negative cycles.
            if (!distancesUpdatedInIteration && iterationNum < variableCount - 1) {
                break;
            }
        }

        // After Bellman-Ford, check if the dummy node's distance is valid.
        // `pathDistances[0] < 0` indicates a negative cycle reachable from node 0,
        // implying an impossible set of constraints for this combination.
        if (pathDistances[0] >= 0) {
            // If the current combination of constraints is valid,
            // update the overall maximum value for the last variable (variableCount - 1).
            optimalValue = Math.max(optimalValue, pathDistances[variableCount - 1]);
        }
    });

    // Output the final result based on `optimalValue`
    if (optimalValue === INITIAL_DIST_VALUE) {
        displayResult(INVALID_RESULT_INF); // Represents 'infinity'
    } else if (optimalValue === Number.NEGATIVE_INFINITY) {
        displayResult(INVALID_RESULT_NEG); // Represents 'no solution' or '-1'
    } else {
        displayResult(optimalValue);
    }
}

// Standard Node.js input handling setup
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Accumulate input chunks
process.stdin.on('data', function(chunk) {
    rawDataBuffer += chunk;
});

// Once all input is received, process it
process.stdin.on('end', function() {
    // Split the entire input buffer by any whitespace and filter out empty strings
    rawDataBuffer = rawDataBuffer.split(/\s+/).filter(Boolean);
    // Execute the main constraint processing logic
    processConstraintSystem();
});