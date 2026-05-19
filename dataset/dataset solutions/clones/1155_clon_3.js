const getSetRepresentative = parentMap => nodeIdx => {
    let currentParent = parentMap[nodeIdx];
    if (nodeIdx !== currentParent) {
        parentMap[nodeIdx] = getSetRepresentative(parentMap)(currentParent);
    }
    return parentMap[nodeIdx];
};

const performUnionByRank = (parentMap, rankMap) => (rootA, rootB) => {
    let rankA = rankMap[rootA];
    let rankB = rankMap[rootB];

    if (rankA > rankB) {
        parentMap[rootB] = rootA;
    } else {
        parentMap[rootA] = rootB;
        if (rankA === rankB) {
            rankMap[rootB]++;
        }
    }
};

const createDisjointSetStructure = elementCount => {
    const globalContext = this;

    globalContext.parentArray = [];
    globalContext.rankArray = [];

    for (let i = 0; i < elementCount; i++) {
        globalContext.parentArray[i] = i;
    }
    for (let i = 0; i < elementCount; i++) {
        globalContext.rankArray[i] = 0;
    }

    globalContext.getRepresentativeFunc = getSetRepresentative(globalContext.parentArray);
    globalContext.unionFunc = performUnionByRank(globalContext.parentArray, globalContext.rankArray);

    return {
        areElementsInSameSet: (idx1, idx2) => globalContext.getRepresentativeFunc(idx1) === globalContext.getRepresentativeFunc(idx2),
        uniteSets: (idx1, idx2) => {
            const root1 = globalContext.getRepresentativeFunc(idx1);
            const root2 = globalContext.getRepresentativeFunc(idx2);
            if (root1 !== root2) {
                globalContext.unionFunc(root1, root2);
            }
        }
    };
};

const parseQueryLine = lineString => lineString.split(" ").map(Number);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = fileContent.split("\n");

const [initialElementCount, totalQueries] = parseQueryLine(allLines.shift());

const disjointSetManager = createDisjointSetStructure(initialElementCount);

allLines.forEach(currentLine => {
    const [operationCode, argA, argB] = parseQueryLine(currentLine);

    if (operationCode === 0) {
        disjointSetManager.uniteSets(argA, argB);
    } else if (operationCode === 1) {
        const areConnected = disjointSetManager.areElementsInSameSet(argA, argB);
        console.log(areConnected ? 1 : 0);
    }
});
