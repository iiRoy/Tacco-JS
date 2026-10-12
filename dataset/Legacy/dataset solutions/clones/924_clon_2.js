var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input stream

// Process the raw input: trim whitespace and split into an array of lines
var lineArray = rawData.trim().split("\n");

// Extract the first line, which might represent 'n' but is not used in the core logic
var numLines = lineArray.shift();

// Extract the second line, split it by spaces to get individual tokens (operands)
var tokenList = lineArray.shift().split(" ");

/**
 * Recursively evaluates a sequence of boolean tokens based on a custom logical operation.
 * The operation is: result is 'F' only if the first operand is 'T' and the second is 'F'.
 * Otherwise, the result is 'T'.
 *
 * @param {Array<string>} tokenList - An array of string tokens ("T" or "F") representing the expression.
 */
var evaluateExpression = function(tokenList) {
    // Retrieve the first operand from the beginning of the list
    var firstOperand = tokenList.shift();
    // Retrieve the second operand from the beginning of the list
    var secondOperand = tokenList.shift();

    // --- Cases where more tokens remain in the list ---
    // If both operands are "T" and there are more tokens, push "T" back
    if (firstOperand === "T" && secondOperand === "T" && tokenList.length !== 0) {
        tokenList.unshift("T");
    }
    // If first is "T" and second is "F" and there are more tokens, push "F" back
    else if (firstOperand === "T" && secondOperand === "F" && tokenList.length !== 0) {
        tokenList.unshift("F");
    }
    // If first is "F" and second is "T" and there are more tokens, push "T" back
    else if (firstOperand === "F" && secondOperand === "T" && tokenList.length !== 0) {
        tokenList.unshift("T");
    }
    // If both operands are "F" and there are more tokens, push "T" back
    else if (firstOperand === "F" && secondOperand === "F" && tokenList.length !== 0) {
        tokenList.unshift("T");
    }
    // --- Cases where no more tokens remain (base cases for recursion) ---
    // If both operands are "T" and no more tokens, print "T" and return
    else if (firstOperand === "T" && secondOperand === "T" && tokenList.length === 0) {
        console.log("T");
        return;
    }
    // If first is "T" and second is "F" and no more tokens, print "F" and return
    else if (firstOperand === "T" && secondOperand === "F" && tokenList.length === 0) {
        console.log("F");
        return;
    }
    // If first is "F" and second is "T" and no more tokens, print "T" and return
    else if (firstOperand === "F" && secondOperand === "T" && tokenList.length === 0) {
        console.log("T");
        return;
    }
    // If both operands are "F" and no more tokens, print "T" and return
    else if (firstOperand === "F" && secondOperand === "F" && tokenList.length === 0) {
        console.log("T");
        return;
    }

    // If not a base case, recursively call the function with the updated token list
    evaluateExpression(tokenList);
};

// Initiate the evaluation process with the prepared list of tokens
evaluateExpression(tokenList);
