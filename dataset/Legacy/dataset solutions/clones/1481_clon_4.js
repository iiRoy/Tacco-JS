const input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.split('\n');
let [nodeCount, edgeCount] = lines[0].split(' ').map(Number);

const parentArray = Array(nodeCount + 1).fill(0).map((_val, index) => index);
const componentSizes = Array(nodeCount + 1).fill(1);
let distinctComponentCount = nodeCount;

const findRoot = (nodeIdentifier) => {
    if (parentArray[nodeIdentifier] === nodeIdentifier) {
        return nodeIdentifier;
    }
    parentArray[nodeIdentifier] = findRoot(parentArray[nodeIdentifier]);
    return parentArray[nodeIdentifier];
};

const uniteSets = (firstNode, secondNode) => {
    let rootFirst = findRoot(firstNode);
    let rootSecond = findRoot(secondNode);

    if (rootFirst !== rootSecond) {
        if (componentSizes[rootFirst] < componentSizes[rootSecond]) {
            [rootFirst, rootSecond] = [rootSecond, rootFirst];
        }
        parentArray[rootSecond] = rootFirst;
        componentSizes[rootFirst] += componentSizes[rootSecond];
        distinctComponentCount--;
    }
};

for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
    const [uIdentifier, vIdentifier] = lines[edgeIndex].split(' ').map(Number);
    uniteSets(uIdentifier, vIdentifier);
}

console.log(distinctComponentCount - 1);
