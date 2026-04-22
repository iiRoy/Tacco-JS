var sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceContent.trim().split("\n");
var elementCount = dataLines.shift();
var initialOperands = dataLines.shift().split(" ");
var evaluateLogicChain = function(expressionList) {
    var firstTerm = expressionList[0];
    var secondTerm = expressionList[1];
    expressionList = expressionList.slice(2); // Shorten the list by two elements.

    // Recursive step: Evaluate and prepend result if more expressions follow.
    if (firstTerm == "T" && secondTerm == "T" && expressionList.length !== 0) {
        expressionList.unshift("T");
    } else if (firstTerm == "T" && secondTerm == "F" && expressionList.length !== 0) {
        expressionList.unshift("F");
    } else if (firstTerm == "F" && secondTerm == "T" && expressionList.length !== 0) {
        expressionList.unshift("T");
    } else if (firstTerm == "F" && secondTerm == "F" && expressionList.length !== 0) {
        expressionList.unshift("T");
    }
    // Base case: Evaluate and print final result if no more expressions.
    else if (firstTerm == "T" && secondTerm == "T" && expressionList.length === 0) {
        console.log("T");
        return;
    } else if (firstTerm == "T" && secondTerm == "F" && expressionList.length === 0) {
        console.log("F");
        return;
    } else if (firstTerm == "F" && secondTerm == "T" && expressionList.length === 0) {
        console.log("T");
        return;
    } else if (firstTerm == "F" && secondTerm == "F" && expressionList.length === 0) {
        console.log("T");
        return;
    }

    // Continue processing the modified list.
    evaluateLogicChain(expressionList);
};

// Start the evaluation process with the initial sequence of operands.
evaluateLogicChain(initialOperands);