function procureNumericSequence(lineContent) {
    return lineContent.split(/\s+/).map(Number);
}

function constructComponentRegistry(totalNodes) {
    const ancestors = Array.from({ length: totalNodes + 1 }, (_, i) => i);
    const groupSizes = Array.from({ length: totalNodes + 1 }, () => 1);

    const locatePrincipal = (nodeIdx) => {
        if (ancestors[nodeIdx] === nodeIdx) {
            return nodeIdx;
        }
        return (ancestors[nodeIdx] = locatePrincipal(ancestors[nodeIdx]));
    };

    const mergeComponents = (nodeA, nodeB) => {
        let rootA = locatePrincipal(nodeA);
        let rootB = locatePrincipal(nodeB);

        if (rootA !== rootB) {
            if (groupSizes[rootA] < groupSizes[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }
            ancestors[rootB] = rootA;
            groupSizes[rootA] += groupSizes[rootB];
            return true;
        }
        return false;
    };

    const areConnected = (nodeA, nodeB) => {
        return locatePrincipal(nodeA) === locatePrincipal(nodeB);
    };

    return { mergeComponents, areConnected };
}

function processConnectivityAnalysis(rawTextData) {
    const dataLines = rawTextData.split("\n").filter(Boolean);

    const firstLineNumbers = procureNumericSequence(dataLines[0]);
    const maxVertexId = firstLineNumbers[0];

    const mappingValues = procureNumericSequence(dataLines[1]);

    const connectionPairs = dataLines.slice(2).map(line => {
        const [firstNode, secondNode] = procureNumericSequence(line);
        return { first: firstNode, second: secondNode };
    });

    const componentSystem = constructComponentRegistry(maxVertexId);

    connectionPairs.forEach(pair => {
        componentSystem.mergeComponents(pair.first, pair.second);
    });

    let coincidenceCounter = 0;
    for (let k = 0; k < mappingValues.length; ++k) {
        const mappedValue = mappingValues[k];
        const originalIndex = k + 1;

        if (componentSystem.areConnected(mappedValue, originalIndex)) {
            coincidenceCounter++;
        }
    }

    console.log(coincidenceCounter);
    return coincidenceCounter;
}

exports.processConnectivityAnalysis = processConnectivityAnalysis;

try {
    processConnectivityAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (e) {
    // ignore
}