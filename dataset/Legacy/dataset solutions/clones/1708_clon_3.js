const getProcessedInput = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const allLines = fileContent.split(/\n/);
    const firstDataLine = allLines[0];
    const subsequentLines = allLines.slice(1);
    return {
        nodeCountString: firstDataLine,
        edgeLines: subsequentLines
    };
};

const inputContainer = getProcessedInput();
const totalNodeCount = Number(inputContainer.nodeCountString);
const edgeInputLines = inputContainer.edgeLines;

const calculateBaseSum = (countValue) => {
    const termA = countValue;
    const termB = countValue + 1;
    const termC = countValue + 2;
    const product = termA * termB * termC;
    return product / 6;
};

let cumulativeSum = calculateBaseSum(totalNodeCount);

const getOrderedNodes = (firstVal, secondVal) => {
    if (firstVal > secondVal) {
        const temporaryHolder = firstVal;
        firstVal = secondVal;
        secondVal = temporaryHolder;
    }
    return [firstVal, secondVal];
};

edgeInputLines.forEach(currentEdgeLine => {
    const edgeParts = currentEdgeLine.split(' ');
    const rawNodeA = Number(edgeParts[0]);
    const rawNodeB = Number(edgeParts[1]);

    const [nodeIdentifierA, nodeIdentifierB] = getOrderedNodes(rawNodeA, rawNodeB);

    const rightHandFactor = totalNodeCount - nodeIdentifierB + 1;
    const valueToDeduct = nodeIdentifierA * rightHandFactor;
    cumulativeSum -= valueToDeduct;
});

console.log(cumulativeSum);
