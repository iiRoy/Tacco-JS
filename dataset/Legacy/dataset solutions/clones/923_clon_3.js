var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInputData.trim().split("\n");
var numLines = inputLines.shift();
var initialBooleanSequence = inputLines.shift().split(" ");

function computeImplicationResult(valA, valB) {
    const TRUE_TOKEN = "T";
    const FALSE_TOKEN = "F";

    let isSpecificFalseCondition = (valA === TRUE_TOKEN && valB === FALSE_TOKEN);

    if (isSpecificFalseCondition) {
        return FALSE_TOKEN;
    } else {
        return TRUE_TOKEN;
    }
}

var resolveBooleanChain = function(currentSequence) {
    if (currentSequence.length === 1) {
        console.log(currentSequence[0]);
        return;
    }

    var firstElement = currentSequence[0];
    var secondElement = currentSequence[1];

    var intermediateComputedValue = computeImplicationResult(firstElement, secondElement);

    var remainingElements = currentSequence.slice(2);
    var nextIterationSequence = [intermediateComputedValue].concat(remainingElements);

    resolveBooleanChain(nextIterationSequence);
};

resolveBooleanChain(initialBooleanSequence);
