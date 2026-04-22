const evaluateSequence = (inputBlob) => {
    const contentSegments = inputBlob.split('\n');
    const elementQuantity = Number.parseInt(contentSegments[0], 10);
    const initialArrangement = contentSegments[1].split(' ').map(Number.parseInt);
    const orderedReference = initialArrangement.slice().sort((leftVal, rightVal) => leftVal - rightVal);
    const discrepancyCount = initialArrangement.reduce((countAccumulator, currentElement, positionIndex) => {
        return countAccumulator + (currentElement !== orderedReference[positionIndex] ? 1 : 0);
    }, 0);
    return discrepancyCount <= 2 ? "YES" : "NO";
};
const receivedInput = require("node:fs").readFileSync("/dev/stdin", "utf8");
console.log(evaluateSequence(receivedInput));