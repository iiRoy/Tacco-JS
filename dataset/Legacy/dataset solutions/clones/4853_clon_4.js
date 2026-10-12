let sourceData, dataPointer;

function displayResult(outcome) {
    console.log(outcome);
}

function retrieveInteger() {
    return parseInt(fetchNextToken(), 10);
}

function retrieveFloat() {
    return parseFloat(fetchNextToken());
}

function fetchNextToken() {
    return sourceData[dataPointer++];
}

function charMapper(charVal) {
    const charTransformations = new Map([
        ['d', 'b'],
        ['b', 'd'],
        ['p', 'q']
    ]);
    return charTransformations.get(charVal);
}

function executeLogic() {
    const inputSequence = fetchNextToken();
    
    const firstConditionMet = charMapper(inputSequence[0]) === inputSequence[3];
    const secondConditionMet = charMapper(inputSequence[1]) === inputSequence[2];

    displayResult(firstConditionMet && secondConditionMet ? "Yes" : "No");
}

function runDebug() {
    sourceData = document.getElementById("input").value;
    sourceData = sourceData.replace(/\n/g, " ");
    sourceData = sourceData.split(" ");
    dataPointer = 0;
    executeLogic();
}

sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
dataPointer = 0;
executeLogic();
