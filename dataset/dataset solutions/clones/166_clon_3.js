const fileSystemModule = require('fs'); // Core Node.js module for interacting with the file system.

// Function to meticulously acquire and process textual input from standard input.
function procureAndParseInputContent() {
    let rawContentBuffer;
    try {
        // Attempt to synchronously read the entirety of standard input (file descriptor 0).
        // This method blocks execution until the input stream is fully consumed.
        rawContentBuffer = fileSystemModule.readFileSync(process.stdin.fd, { encoding: 'utf8', flag: 'r' });
    } catch (ioException) {
        // Log any errors encountered during the read operation.
        console.error("Error encountered while reading from standard input stream:", ioException.message);
        // Return an empty array to gracefully handle input failures.
        return [];
    }

    // Sanitize the raw input: remove leading/trailing whitespace, then split into individual lines.
    // An additional filter ensures that only non-empty lines are considered.
    const sanitizedLines = rawContentBuffer
        .trim() // Eliminates extraneous whitespace from the start and end of the entire input.
        .split('\n') // Breaks the string into an array of lines based on newline characters.
        .filter(lineSegment => lineSegment.length > 0); // Discards any blank lines.

    // Provide a warning if no meaningful input was obtained after parsing.
    if (sanitizedLines.length === 0) {
        console.warn("No valid input lines detected after processing. Execution will proceed without data.");
    }

    return sanitizedLines;
}

// Global immutable array to store all processed input lines, each representing a set of numbers.
const processedInputLines = procureAndParseInputContent();

// Initiate the primary computational process.
beginCalculationEngine();

// --- Auxiliary Routines for Expression Handling ---

/**
 * Executes a basic arithmetic calculation between two numerical operands using a specified operator.
 * @param {number} firstTerm - The left-hand side numerical value.
 * @param {number} secondTerm - The right-hand side numerical value.
 * @param {string} operatorSymbol - The character representing the arithmetic operation ('+', '-', '*').
 * @returns {number} The computed result of the operation.
 * @throws {Error} If an unrecognized operator symbol is provided.
 */
function computeBinaryOperation(firstTerm, secondTerm, operatorSymbol) {
    switch (operatorSymbol) {
        case '+': return firstTerm + secondTerm;
        case '-': return firstTerm - secondTerm;
        case '*': return firstTerm * secondTerm;
        default:
            // This case should ideally not be reached with valid problem constraints.
            throw new Error(`Unidentified arithmetic operator encountered: '${operatorSymbol}'.`);
    }
}

/**
 * Interprets and evaluates an expression presented in Reverse Polish Notation (RPN).
 * This function processes a sequence of numbers and operators to yield a single numerical result.
 * @param {(number|string)[]} rpnSequence - An ordered array of numbers (operands) and strings (operators).
 * @returns {number} The final numerical outcome of the RPN expression.
 * @throws {Error} If the RPN sequence is malformed (e.g., insufficient operands for an operator).
 */
function evaluateRpnExpression(rpnSequence) {
    const operandStash = []; // A temporary stack for holding numbers during evaluation.

    for (const item of rpnSequence) {
        if (typeof item === 'number') {
            // If the item is a number, it's an operand; push it onto the stash.
            operandStash.push(item);
        } else if (typeof item === 'string') { // Assumed to be an operator symbol.
            // For an operator, two operands are required from the stash.
            if (operandStash.length < 2) {
                // This indicates an error in the RPN sequence's construction.
                throw new Error("RPN evaluation failure: Stack underflow. Not enough operands for an operator.");
            }
            // Retrieve operands in the correct order for non-commutative operations (e.g., subtraction).
            const opB = operandStash.pop(); // Right operand.
            const opA = operandStash.pop(); // Left operand.
            const intermediateResult = computeBinaryOperation(opA, opB, item);
            operandStash.push(intermediateResult);
        } else {
            // Handle unexpected data types within the RPN sequence.
            throw new Error(`RPN evaluation failure: Encountered an unexpected token type: '${typeof item}'.`);
        }
    }

    // A correctly formed RPN expression should leave exactly one value on the stash.
    if (operandStash.length !== 1) {
        throw new Error("RPN evaluation failure: Expression malformed, final stack size is not one.");
    }
    return operandStash.pop(); // The final result.
}

/**
 * Transforms an RPN token sequence back into a human-readable infix expression string,
 * ensuring correct parenthesization to reflect the order of operations.
 * @param {(number|string)[]} rpnTokenList - The RPN expression's tokens.
 * @returns {string} The parenthesized infix string representation.
 */
function generateInfixRepresentation(rpnTokenList) {
    const infixStringStack = []; // Stack to build the infix parts.

    for (const token of rpnTokenList) {
        if (typeof token === 'number') {
            infixStringStack.push(token.toString()); // Convert numbers to string representation.
        } else if (typeof token === 'string') { // It's an operator.
            // Pop the two most recent expressions (right and left operands) from the stack.
            const rightExpression = infixStringStack.pop();
            const leftExpression = infixStringStack.pop();
            // Combine them with the operator, enclosing the entire operation in parentheses.
            infixStringStack.push(`(${leftExpression} ${token} ${rightExpression})`);
        }
    }
    // The final result is the single remaining string on the stack.
    return infixStringStack.pop();
}

// --- Main Program Execution Function ---
function beginCalculationEngine() {
    // The set of permissible arithmetic operators for the "24 game".
    const permittedOperators = ['+', '-', '*'];

    // Define the three structural patterns (parenthesizations) in RPN form.
    // Each element specifies the order of numbers (N1, N2, N3, N4) and operators (O1, O2, O3).
    // These patterns ensure all standard groupings are tried.
    const rpnStructureTemplates = [
        // Pattern 1: (((N1 O1 N2) O2 N3) O3 N4) -> N1 N2 O1 N3 O2 N4 O3
        [0, 1, 'op1', 2, 'op2', 3, 'op3'],
        // Pattern 2: ((N1 O1 (N2 O2 N3)) O3 N4) -> N1 N2 N3 O2 O1 N4 O3
        [0, 1, 2, 'op2', 'op1', 3, 'op3'],
        // Pattern 3: ((N1 O1 N2) O3 (N3 O2 N4)) -> N1 N2 O1 N3 N4 O2 O3
        [0, 1, 'op1', 2, 3, 'op2', 'op3']
    ];

    // Iterate through each provided line of numerical input.
    // Using a traditional for loop for explicit index management and the break condition.
    for (let currentInputIdx = 0; currentInputIdx < processedInputLines.length; ++currentInputIdx) {
        const currentRawLine = processedInputLines[currentInputIdx];

        // Sentinel value check: "0 0 0 0" signals the end of input data.
        if (currentRawLine === '0 0 0 0') {
            break; // Terminate processing.
        }

        // Convert the space-separated string of numbers into an array of actual numbers.
        const currentNumberSet = currentRawLine.split(' ').map(Number);

        // Input validation: Ensure exactly four valid numbers are present.
        if (currentNumberSet.length !== 4 || currentNumberSet.some(isNaN)) {
            console.warn(`Skipping invalid input line: "${currentRawLine}". Expected four numbers.`);
            continue; // Move to the next input line.
        }

        let solutionWasFound = false; // Flag to track if a solution is identified for the current set.

        // Label to allow breaking out of all nested loops once a solution is found.
        SEARCH_SPACE_EXPLORATION:
        // Begin exhaustive search: Permutations of the four numbers.
        for (let p1 = 0; p1 < 4; ++p1) {
            const numA = currentNumberSet[p1];

            for (let p2 = 0; p2 < 4; ++p2) {
                if (p1 === p2) continue; // Ensure distinct indices for numbers.
                const numB = currentNumberSet[p2];

                for (let p3 = 0; p3 < 4; ++p3) {
                    if (p1 === p3 || p2 === p3) continue; // Ensure distinct indices.
                    const numC = currentNumberSet[p3];

                    for (let p4 = 0; p4 < 4; ++p4) {
                        if (p1 === p4 || p2 === p4 || p3 === p4) continue; // Ensure distinct indices.
                        const numD = currentNumberSet[p4];

                        // At this point, (numA, numB, numC, numD) is a unique permutation of the input numbers.

                        // Iterate through all possible combinations for the three operators.
                        for (let opIdx1 = 0; opIdx1 < 3; ++opIdx1) {
                            const opSym1 = permittedOperators[opIdx1];

                            for (let opIdx2 = 0; opIdx2 < 3; ++opIdx2) {
                                const opSym2 = permittedOperators[opIdx2];

                                for (let opIdx3 = 0; opIdx3 < 3; ++opIdx3) {
                                    const opSym3 = permittedOperators[opIdx3];

                                    // Optimization: Skip if all three operators are subtraction.
                                    // This prunes redundant or non-standard solutions, as per the original intent.
                                    if (opSym1 === '-' && opSym2 === '-' && opSym3 === '-') {
                                        continue;
                                    }

                                    // Explore the different structural patterns (parenthesizations) for the current numbers and operators.
                                    for (let structIdx = 0; structIdx < rpnStructureTemplates.length; ++structIdx) {
                                        const currentTemplate = rpnStructureTemplates[structIdx];
                                        const constructedRpnTokens = [];

                                        // Build the RPN token array based on the current template.
                                        for (const templateElement of currentTemplate) {
                                            if (typeof templateElement === 'number') {
                                                // If it's a number (0-3), it refers to the index in the current permutation (numA, numB, numC, numD).
                                                // This requires a helper array to map indices to values.
                                                const currentPermutation = [numA, numB, numC, numD];
                                                constructedRpnTokens.push(currentPermutation[templateElement]);
                                            } else {
                                                // If it's a string like 'op1', 'op2', 'op3', substitute with the actual operator symbol.
                                                switch (templateElement) {
                                                    case 'op1': constructedRpnTokens.push(opSym1); break;
                                                    case 'op2': constructedRpnTokens.push(opSym2); break;
                                                    case 'op3': constructedRpnTokens.push(opSym3); break;
                                                    default:
                                                        // Fallback for unexpected template elements.
                                                        console.error(`Internal error: Unknown template element '${templateElement}'.`);
                                                        continue SEARCH_SPACE_EXPLORATION; // Abort for this set.
                                                }
                                            }
                                        }

                                        // Attempt to evaluate the newly constructed RPN expression.
                                        try {
                                            const computedResult = evaluateRpnExpression(constructedRpnTokens);

                                            // Check if the result is the target value (10).
                                            if (computedResult === 10) {
                                                solutionWasFound = true; // Mark that a solution has been successfully identified.
                                                // Generate and display the infix form of the successful expression.
                                                const displayExpression = generateInfixRepresentation(constructedRpnTokens);
                                                console.log(displayExpression);
                                                // Break out of all permutation and operator loops for the current input set.
                                                break SEARCH_SPACE_EXPLORATION;
                                            }
                                        } catch (evalError) {
                                            // Silently catch evaluation errors (e.g., division by zero if it were included, or malformed RPN).
                                            // For this problem, generated RPN should be valid, but robust code includes this.
                                            // console.warn(`Evaluation error for RPN: ${constructedRpnTokens.join(' ')} - ${evalError.message}`);
                                        }
                                    } // End of RPN structure variant loop
                                } // End of opIdx3 loop
                            } // End of opIdx2 loop
                        } // End of opIdx1 loop
                    } // End of p4 loop
                } // End of p3 loop
            } // End of p2 loop
        } // End of p1 loop (SEARCH_SPACE_EXPLORATION)

        // If after exhausting all possibilities, no expression evaluates to 10, print 0.
        if (!solutionWasFound) {
            console.log(0);
        }
    } // End of processedInputLines loop
}