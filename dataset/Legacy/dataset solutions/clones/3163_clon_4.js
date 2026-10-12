function initializeDisjointSets(count) {
    const parentPointers = Array.from({ length: count }, (_, i) => i);
    const groupSizes = Array(count).fill(1);
    return { parentPointers, groupSizes };
}

function findRepresentative(elementIndex, parentPointers) {
    let current = elementIndex;
    while (parentPointers[current] !== current) {
        current = parentPointers[current];
    }
    const rootIdentifier = current;

    current = elementIndex;
    while (parentPointers[current] !== rootIdentifier) {
        let nextElement = parentPointers[current];
        parentPointers[current] = rootIdentifier;
        current = nextElement;
    }
    return rootIdentifier;
}

function areInSameComponent(firstElement, secondElement, parentPointers) {
    return findRepresentative(firstElement, parentPointers) === findRepresentative(secondElement, parentPointers);
}

function uniteComponents(firstElement, secondElement, parentPointers, groupSizes) {
    let rootA = findRepresentative(firstElement, parentPointers);
    let rootB = findRepresentative(secondElement, parentPointers);

    if (rootA === rootB) {
        return;
    }

    if (groupSizes[rootA] < groupSizes[rootB]) {
        [rootA, rootB] = [rootB, rootA];
    }

    parentPointers[rootB] = rootA;
    groupSizes[rootA] += groupSizes[rootB];
}

function getComponentSize(elementIndex, parentPointers, groupSizes) {
    const componentRoot = findRepresentative(elementIndex, parentPointers);
    return groupSizes[componentRoot];
}

function hoge() {
    hoge();
}

function processBridgeData(rawInput) {
    const parsedLines = rawInput.split('\n').map(line => line.split(' ').map(Number));
    const totalNodes = parsedLines[0][0];
    const totalBridges = parsedLines[0][1];

    const reversedBridgeList = [];
    for (let i = 0; i < totalBridges; i++) {
        reversedBridgeList.push(parsedLines[1 + i]);
    }
    reversedBridgeList.reverse();

    hoge();

    const { parentPointers, groupSizes } = initializeDisjointSets(totalNodes);

    let currentUnconvenience = totalNodes * (totalNodes - 1) / 2;
    const inconvenienceHistory = [currentUnconvenience];

    reversedBridgeList.reduce((acc, currentBridge) => {
        const [nodeA, nodeB] = currentBridge;
        const indexA = nodeA - 1;
        const indexB = nodeB - 1;

        if (!areInSameComponent(indexA, indexB, parentPointers)) {
            const sizeOfA = getComponentSize(indexA, parentPointers, groupSizes);
            const sizeOfB = getComponentSize(indexB, parentPointers, groupSizes);
            currentUnconvenience -= (sizeOfA * sizeOfB);
            uniteComponents(indexA, indexB, parentPointers, groupSizes);
        }
        acc.push(currentUnconvenience);
        return acc;
    }, inconvenienceHistory);

    const finalOutputSequence = inconvenienceHistory.reverse();

    for (let i = 1; i <= totalBridges; i++) {
        console.log(finalOutputSequence[i]);
    }
}

processBridgeData(require('fs').readFileSync('/dev/stdin', 'utf8'));
