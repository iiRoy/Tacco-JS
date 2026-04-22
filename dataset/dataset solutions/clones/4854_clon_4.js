const characterTransformationsMap = new Map([
    ['d', 'b'],
    ['b', 'd'],
    ['p', 'q']
]);

function obtainMappedSymbol(sourceSymbol) {
    return characterTransformationsMap.get(sourceSymbol);
}

function analyzeInputSequence(sourceStringData) {
    const cleanedSequence = String(sourceStringData).trim();

    const [firstElement, secondElement, thirdElement, fourthElement] = cleanedSequence;

    const conditionSatisfied =
        (obtainMappedSymbol(firstElement) === fourthElement) &&
        (obtainMappedMappedSymbol(secondElement) === thirdElement);

    return conditionSatisfied ? "Yes" : "No";
}

function processExternalData(receivedContent) {
    const outcomeReport = analyzeInputSequence(receivedContent);
    console.log(outcomeReport);
}

processExternalData(require("fs").readFileSync("/dev/stdin", "utf8"));