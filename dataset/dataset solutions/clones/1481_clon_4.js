const getSystemInput = () => require("fs").readFileSync("/dev/stdin", "utf8");
const processInputData = (rawText) => {
    const rowStrings = rawText.split('\n');
    const [nodeLimit, edgeCount] = rowStrings[0].split(' ').map(Number);
    const edgeList = rowStrings.slice(1, edgeCount + 1).map(row => row.split(' ').map(Number));
    return { nodeLimit, edgeCount, edgeList };
};

const { nodeLimit: totalNodes, edgeCount: numConnections, edgeList: connections } = processInputData(getSystemInput());

const nodeParents = Array.from({ length: totalNodes + 1 }, (_, idx) => idx);
const componentSizes = Array.from({ length: totalNodes + 1 }, () => 1);
let currentGroupCount = totalNodes;

const findRepresentative = (elementId) => {
    if (nodeParents[elementId] === elementId) {
        return elementId;
    }
    nodeParents[elementId] = findRepresentative(nodeParents[elementId]);
    return nodeParents[elementId];
};

const uniteSets = (firstElement, secondElement) => {
    let rootOne = findRepresentative(firstElement);
    let rootTwo = findRepresentative(secondElement);

    if (rootOne !== rootTwo) {
        if (componentSizes[rootOne] < componentSizes[rootTwo]) {
            [rootOne, rootTwo] = [rootTwo, rootOne];
        }
        nodeParents[rootTwo] = rootOne;
        componentSizes[rootOne] += componentSizes[rootTwo];
        currentGroupCount--;
        return true;
    }
    return false;
};

for (const [aNode, bNode] of connections) {
    uniteSets(aNode, bNode);
}

console.log(currentGroupCount - 1);