const fileSystem = require('fs'); // Renamed 'fs' to 'fileSystem' for clarity

let rawInputContent = '';
try {
    // Read entire standard input synchronously.
    // This is a common pattern in Node.js for competitive programming to get all input at once.
    rawInputContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
} catch (readError) {
    // Handle potential errors during input file reading.
    // For example, if stdin is not properly piped or empty.
    console.error("Error encountered while attempting to read standard input:", readError.message);
    // Terminate the process if input is critical for execution.
    process.exit(1); 
}

// Process the raw text input:
// 1. Trim leading/trailing whitespace.
// 2. Split into individual lines.
// 3. Filter out any lines that are empty after trimming.
const programInputLines = rawInputContent.trim().split('\n').filter(line => line.length > 0);

// Initiate the primary calculation process.
executeMathematicalExpressionSearch();

/**
 * Defines the core arithmetic operations used in the problem.
 * @type {string[]}
 */
const mathematicalOperators = ['+', '-', '*']; // Renamed 'operands'

/**
 * Helper function to evaluate an expression represented in Reverse Polish Notation (RPN).
 * @param {Array<number|string>} tokens - An array of numbers and operator strings.
 * @returns {number} The result of the evaluation, or NaN if an error occurs.
 */
function evaluatePostfixExpression(tokens) {
    const evaluationStack = []; // Renamed 'stack' to 'evaluationStack'

    for (const currentToken of tokens) { // Renamed 'j' to iteration variable, 'h' to 'currentToken'
        if (typeof currentToken === 'number') {
            evaluationStack.push(currentToken);
        } else if (typeof currentToken === 'string' && mathematicalOperators.includes(currentToken)) {
            // Ensure there are at least two operands available on the stack for an operation.
            if (evaluationStack.length < 2) {
                // This scenario indicates an invalid RPN expression structure.
                // For this problem, the RPN structures are predefined and should be valid,
                // so this acts as a robust guard clause.
                console.error("RPN evaluation failed: Insufficient operands on stack for operator:", currentToken);
                return NaN; // Return Not-a-Number to signal an error.
            }
            const rightOperand = evaluationStack.pop(); // The second operand (right side of binary operation)
            const leftOperand = evaluationStack.pop();  // The first operand (left side of binary operation)

            let intermediateCalculationResult;
            switch (currentToken) {
                case '+':
                    intermediateCalculationResult = leftOperand + rightOperand;
                    break;
                case '-':
                    intermediateCalculationResult = leftOperand - rightOperand; // Correct order for subtraction.
                    break;
                case '*':
                    intermediateCalculationResult = leftOperand * rightOperand;
                    break;
                // No default case is explicitly needed here, as operators are pre-validated.
            }
            evaluationStack.push(intermediateCalculationResult);
        } else {
            // Catches unexpected token types that are neither numbers nor valid operators.
            console.error("RPN evaluation failed: Encountered an unexpected token type:", currentToken);
            return NaN;
        }
    }

    // After processing all tokens, a valid RPN expression should leave exactly one result on the stack.
    if (evaluationStack.length !== 1) {
        console.error("RPN evaluation failed: Stack did not resolve to a single final value.");
        return NaN;
    }
    return evaluationStack.pop();
}

/**
 * Helper function to convert an RPN token array back into a human-readable, parenthesized infix expression string.
 * @param {Array<number|string>} rpnTokens - The RPN token array that was evaluated.
 * @returns {string} The formatted infix expression string.
 */
function formatInfixExpression(rpnTokens) {
    const infixExpressionStack = []; // Renamed 'result' to 'infixExpressionStack'
    for (const tokenElement of rpnTokens) { // Renamed 'j', 'h'
        if (typeof tokenElement === 'number') {
            infixExpressionStack.push(String(tokenElement)); // Convert numbers to strings for concatenation.
        } else if (typeof tokenElement === 'string' && mathematicalOperators.includes(tokenElement)) {
            // Ensure there are enough operands on the stack to form an infix operation.
            if (infixExpressionStack.length < 2) {
                console.error("Infix formatting error: Not enough operands for operator " + tokenElement);
                return "Error in expression formatting";
            }
            const rightOperandString = infixExpressionStack.pop(); // Renamed 'r'
            const leftOperandString = infixExpressionStack.pop();  // Renamed 'l'
            // Construct a parenthesized infix expression using template literals for clarity.
            infixExpressionStack.push(`(${leftOperandString} ${tokenElement} ${rightOperandString})`);
        }
    }
    // The final result should be the single, fully-formatted expression string.
    return infixExpressionStack.pop();
}


/**
 * Main function to orchestrate the search for expressions that evaluate to 10.
 */
function executeMathematicalExpressionSearch() { // Renamed 'main' to 'executeMathematicalExpressionSearch'
    let currentLineIndex = 0; // Renamed 'i' to 'currentLineIndex'
    let currentInputLineData; // Renamed 'inp' to 'currentInputLineData'

    // Loop through each line of input until a termination sequence ("0 0 0 0") is encountered.
    while (currentLineIndex < programInputLines.length && 
           (currentInputLineData = programInputLines[currentLineIndex]) !== '0 0 0 0') {
        
        // Basic validation: skip empty or malformed lines.
        if (!currentInputLineData || currentInputLineData.trim().length === 0) {
            console.warn(`Skipping empty or invalid input line at index ${currentLineIndex}`);
            currentLineIndex++;
            continue;
        }

        // Convert the space-separated string of numbers into an array of integers.
        const numbersForEvaluation = currentInputLineData.split(' ').map(str => parseInt(str.trim(), 10)); // Renamed 'inp', added parseInt and radix for robustness

        // Input validation: ensure exactly four numbers and that they are valid integers.
        if (numbersForEvaluation.length !== 4 || numbersForEvaluation.some(isNaN)) {
            console.error(`Invalid number format detected on line ${currentLineIndex + 1}: "${currentInputLineData}". Expected 4 valid numbers.`);
            currentLineIndex++;
            continue; // Skip to the next input line if this one is malformed.
        }

        // A flag to indicate if a solution (an expression evaluating to 10) has been found
        // for the current set of four numbers.
        let solutionFoundForCurrentSet = false; // Renamed 'found'

        // This array tracks unique permutations of the four input numbers to prevent redundant calculations.
        // It assumes numbers are single digits (0-9) for this mapping (e.g., 1234 for [1,2,3,4]).
        // A maximum value for a 4-digit number (9999) requires an array of size 10000.
        const processedNumberArrangements = new Array(10000).fill(false); // Renamed 'searched', using regular Array.

        // Outer loop label to allow breaking out of all nested loops once a solution is found.
        allPermutationsSearch: // Renamed 'FIRST' label.
        for (let idxA = 0; idxA < 4; idxA++) { // Renamed 'a' to 'idxA'
            const valA = numbersForEvaluation[idxA]; // Renamed 'inpa'

            for (let idxB = 0; idxB < 4; idxB++) { // Renamed 'b' to 'idxB'
                if (idxA === idxB) continue; // Ensure numbers are distinct by index.
                const valB = numbersForEvaluation[idxB]; // Renamed 'inpb'

                for (let idxC = 0; idxC < 4; idxC++) { // Renamed 'c' to 'idxC'
                    if (idxA === idxC || idxB === idxC) continue; // Ensure distinct indices.
                    const valC = numbersForEvaluation[idxC]; // Renamed 'inpc'

                    for (let idxD = 0; idxD < 4; idxD++) { // Renamed 'd' to 'idxD'
                        if (idxA === idxD || idxB === idxD || idxC === idxD) continue; // Ensure distinct indices.
                        const valD = numbersForEvaluation[idxD]; // Renamed 'inpd'

                        // If a solution has already been identified for the current set of numbers,
                        // there's no need to continue with further permutations.
                        if (solutionFoundForCurrentSet) {
                            break allPermutationsSearch; // Exit all nested permutation loops.
                        }

                        // Construct a unique key for the current permutation of values (e.g., 1234 for [1,2,3,4]).
                        // This relies on the assumption that the input numbers are single digits (0-9).
                        const currentPermutationKey = (valA * 1000) + (valB * 100) + (valC * 10) + valD; // Renamed 'target'

                        // Check if this specific arrangement of four numbers has already been processed.
                        // This avoids redundant calculations for permutations that result in the same numerical order.
                        if (processedNumberArrangements[currentPermutationKey]) {
                            continue; // Skip to the next distinct permutation.
                        }
                        // Mark this arrangement as processed.
                        processedNumberArrangements[currentPermutationKey] = true;

                        // Iterate through all possible combinations for the three operators.
                        for (let operatorIdx1 = 0; operatorIdx1 < 3; operatorIdx1++) { // Renamed 'op1'
                            const currentOperator1 = mathematicalOperators[operatorIdx1]; // Renamed 'operandsop1'

                            for (let operatorIdx2 = 0; operatorIdx2 < 3; operatorIdx2++) { // Renamed 'op2'
                                const currentOperator2 = mathematicalOperators[operatorIdx2]; // Renamed 'operandsop2'

                                for (let operatorIdx3 = 0; operatorIdx3 < 3; operatorIdx3++) { // Renamed 'op3'
                                    const currentOperator3 = mathematicalOperators[operatorIdx3]; // Renamed 'operandsop3'

                                    // Optimization: Skip the specific combination where all three operators are subtraction.
                                    // This might be a problem-specific optimization to avoid trivial or redundant checks.
                                    const isAllSubtractionCombination = (currentOperator1 === '-' && currentOperator2 === '-' && currentOperator3 === '-');
                                    if (isAllSubtractionCombination) {
                                        continue; // Move to the next operator combination.
                                    }

                                    // If a solution has already been found, stop exploring further operator combinations.
                                    if (solutionFoundForCurrentSet) {
                                        break allPermutationsSearch; // Exit all loops.
                                    }
                                    
                                    // Explore three different expression structures (operator precedences/groupings).
                                    for (let expressionShapeIndex = 0; expressionShapeIndex < 3; expressionShapeIndex++) { // Renamed 'pattern'
                                        // If a solution is found, no need to check other expression patterns.
                                        if (solutionFoundForCurrentSet) {
                                            break allPermutationsSearch; // Exit all loops.
                                        }

                                        let postfixTokensArray = []; // Renamed 'polish'

                                        // Construct the RPN token array based on the current expression pattern.
                                        if (expressionShapeIndex === 0) {
                                            // Pattern 1: (((valA op1 valB) op2 valC) op3 valD)
                                            // RPN: valA valB op1 valC op2 valD op3
                                            postfixTokensArray = [valA, valB, currentOperator1, valC, currentOperator2, valD, currentOperator3];
                                        } else if (expressionShapeIndex === 1) {
                                            // Pattern 2: ((valA op2 (valB op1 valC)) op3 valD)
                                            // RPN: valA valB valC op1 op2 valD op3
                                            postfixTokensArray = [valA, valB, valC, currentOperator1, currentOperator2, valD, currentOperator3];
                                        } else if (expressionShapeIndex === 2) {
                                            // Pattern 3: ((valA op1 valB) op3 (valC op2 valD))
                                            // RPN: valA valB op1 valC valD op2 op3
                                            // Note: The original RPN implementation for pattern 3 corresponds to this structure,
                                            // despite a potentially misleading comment in the original code.
                                            postfixTokensArray = [valA, valB, currentOperator1, valC, valD, currentOperator2, currentOperator3];
                                        }

                                        // Evaluate the constructed RPN expression.
                                        const currentCalculationResult = evaluatePostfixExpression(postfixTokensArray);

                                        // Check if the evaluated result matches the target value (10).
                                        if (currentCalculationResult === 10) {
                                            solutionFoundForCurrentSet = true; // Mark as found.

                                            // If 10 is found, format the expression and print it.
                                            const formattedExpression = formatInfixExpression(postfixTokensArray);
                                            console.log(formattedExpression);
                                            break allPermutationsSearch; // Exit all loops immediately.
                                        }
                                    } // End of expressionShapeIndex loop
                                } // End of operatorIdx3 loop
                            } // End of operatorIdx2 loop
                        } // End of operatorIdx1 loop
                    } // End of idxD loop
                } // End of idxC loop
            } // End of idxB loop
        } // End of idxA loop (allPermutationsSearch)

        // If, after checking all permutations, operators, and patterns, no solution was found for the current set of numbers.
        if (!solutionFoundForCurrentSet) {
            console.log(0); // Print 0 to indicate no solution.
        }
        
        currentLineIndex++; // Move to the next line of input.
    } // End of while loop for input lines
} // End of executeMathematicalExpressionSearch function