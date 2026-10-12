const inputData = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s+/).filter(Boolean);
let inputCursor = 0;

const retrieveNext = () => Number(inputData[inputCursor++]);
const retrievePair = () => [Number(inputData[inputCursor++]), Number(inputData[inputCursor++])];

const createDisjointSetUnion = (elementCount) => {
    const parentMap = new Map();
    const sizeMap = new Map();

    for (let i = 1; i <= elementCount; i++) {
        parentMap.set(i, i);
        sizeMap.set(i, 1);
    }

    const findRepresentative = (nodeIdentifier) => {
        let currentParent = parentMap.get(nodeIdentifier);
        if (currentParent === nodeIdentifier) {
            return nodeIdentifier;
        }
        const root = findRepresentative(currentParent);
        parentMap.set(nodeIdentifier, root);
        return root;
    };

    const mergeSets = (nodeA, nodeB) => {
        const rootA = findRepresentative(nodeA);
        const rootB = findRepresentative(nodeB);

        if (rootA === rootB) {
            return false;
        }

        const sizeA = sizeMap.get(rootA);
        const sizeB = sizeMap.get(rootB);

        if (sizeA < sizeB) {
            parentMap.set(rootA, rootB);
            sizeMap.set(rootB, sizeA + sizeB);
            sizeMap.delete(rootA);
        } else {
            parentMap.set(rootB, rootA);
            sizeMap.set(rootA, sizeA + sizeB);
            sizeMap.delete(rootB);
        }
        return true;
    };

    const getAllComponentSizes = () => {
        return Array.from(sizeMap.values());
    };

    return {
        findRepresentative,
        mergeSets,
        getAllComponentSizes
    };
};

const executeMainLogic = () => {
    const nodeCount = retrieveNext();
    const operationCount = retrieveNext();

    const dsuInstance = createDisjointSetUnion(nodeCount);

    Array.from({ length: operationCount }).forEach(() => {
        const [u, v] = retrievePair();
        dsuInstance.mergeSets(u, v);
    });

    const allSizes = dsuInstance.getAllComponentSizes();
    return Math.max(...allSizes);
};

const programOutput = executeMainLogic();
if (programOutput !== undefined) {
    console.log(String(programOutput));
}
