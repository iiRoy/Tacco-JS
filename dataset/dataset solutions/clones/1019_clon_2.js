// This section is responsible for obtaining initial textual input, cleaning it,
// and preparing it for numerical processing by converting recognized numbers.
const initialPayload = require('fs')
    .readFileSync(
        '/app/source_input.txt', // A different path for input data.
        'utf8' // Standard text encoding specified.
    )
    .trim() // Removes leading/trailing whitespace from the entire string.
    .split(' ') // Breaks the string into an array of substrings using space as delimiter.
    .map(function (itemFragment) { // Iterates over each fragment to transform it.
        const parsedInteger = parseInt(itemFragment, 10); // Attempts to convert fragment to an integer (base 10).
        if (!isNaN(parsedInteger)) { // Checks if the parsing was successful (result is not Not-a-Number).
            return parsedInteger; // If it's a number, return the integer.
        } else {
            return itemFragment; // Otherwise, return the fragment as its original string type.
        }
    });


/*
 *  Function to ascertain if a given set of arguments is suitable for an arithmetic operation.
 *  It checks the data types of the two primary values and the operation symbol.
 *  @param {any} firstOperand - The first value involved in a potential calculation.
 *  @param {any} secondOperand - The second value involved in a potential calculation.
 *  @param {any} operationSymbol - The symbol representing the arithmetic operation.
 *  @returns {boolean} - True if all types are compatible (two numbers, one string operator), false otherwise.
 */
function isComputationViable(firstOperand,
                             secondOperand,
                             operationSymbol) {
    if (typeof firstOperand === 'number' &&
        typeof secondOperand === 'number' &&
        typeof operationSymbol === 'string') {
        return true;
    }
    return false;
}


// This routine executes a basic mathematical operation between two numbers based on a provided symbol.
function executeArithmetic(firstValue, secondValue, operatorSign) {
    switch (operatorSign) {
        case '+': // Addition operation.
            return firstValue + secondValue;
        case '-': // Subtraction operation.
            return firstValue - secondValue;
        case '*': // Multiplication operation.
            return firstValue * secondValue;
        // No default case, implying only these operations are supported.
    }
}


/**
 *  The main recursive function that processes an array representing an expression,
 *  reducing it by performing calculations until a single result remains.
 *  It expects an RPN-like structure where operations are applied to the preceding two numbers.
 *  @param {Array<string|number>} expressionTokens - An array containing numbers and operator symbols.
 */
function evaluateSequence(expressionTokens) {
    const tokenCount = expressionTokens.length; // Get the total number of items in the current sequence.

    if (tokenCount === 1) { // If only one item is left, it's the final computed result.
        console.log(expressionTokens[0]); // Output the final value.
        return; // Terminate the recursive call.
    }

    const nextSequenceBuffer = []; // Initialize an array to store the results for the next iteration.
    for (let indexPosition = 0; indexPosition < tokenCount; indexPosition += 3) { // Iterate through the tokens in steps of three.
        const currentTriplet = expressionTokens.slice(indexPosition); // Create a temporary slice from the current index.

        const valOne = currentTriplet.shift(); // Extract the first value (operand).
        const valTwo = currentTriplet.shift(); // Extract the second value (operand).
        const opIdentifier = currentTriplet.shift(); // Extract the operation identifier.

        // Check if the extracted values and operator can form a valid calculation.
        if (isComputationViable(valOne, valTwo, opIdentifier)) {
            // If viable, perform the calculation and add the result to the next sequence.
            nextSequenceBuffer.push(executeArithmetic(valOne, valTwo, opIdentifier));
        } else {
            // If not viable, push the original elements back into the buffer
            // in the order they were processed (reverse of how they are consumed from `tmp`).
            if (typeof opIdentifier !== 'undefined') {
                nextSequenceBuffer.push(opIdentifier);
            }
            if (typeof valTwo !== 'undefined') {
                nextSequenceBuffer.push(valTwo);
            }
            if (typeof valOne !== 'undefined') {
                nextSequenceBuffer.push(valOne);
            }
        }
    }

    // Recursively call the function with the newly formed (and hopefully shorter) sequence.
    evaluateSequence(nextSequenceBuffer);
}

// Begin the evaluation process with the initially prepared payload data.
evaluateSequence(initialPayload);