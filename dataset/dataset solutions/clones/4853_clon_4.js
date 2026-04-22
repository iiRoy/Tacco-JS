let segmentPointer = 0;
let sourceDataSegments;

const characterTransformationMap = new Map([
    ['d', 'b'],
    ['b', 'd'],
    ['p', 'q']
]);

function obtainNextSegment() {
    if (!sourceDataSegments) {
        sourceDataSegments = rawInputContent.trim().split(/\s+/);
    }
    return sourceDataSegments[segmentPointer++];
}

function applySymbolTransformation(incomingSymbol) {
    return characterTransformationMap.get(incomingSymbol);
}

function executeCoreLogic() {
    const sequenceToEvaluate = obtainNextSegment();

    const checkSymmetricPair = (charA, charB) => applySymbolTransformation(charA) === charB;

    const firstPairMatch = checkSymmetricPair(sequenceToEvaluate[0], sequenceToEvaluate[3]);
    const secondPairMatch = checkSymmetricPair(sequenceToEvaluate[1], sequenceToEvaluate[2]);

    const finalOutcome = (firstPairMatch && secondPairMatch) ? "Yes" : "No";
    console.log(finalOutcome);
}

let rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
executeCoreLogic();