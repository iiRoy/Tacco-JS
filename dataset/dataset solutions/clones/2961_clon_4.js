(function() {
    const obtainInputData = (sourceText) => {
        const rawLines = sourceText.split('\n').filter(lineContent => lineContent.trim().length > 0);
        const totalVertices = Number(rawLines[0]);
        const linkRecords = [];
        for (let lineIndex = 1; lineIndex < rawLines.length; ++lineIndex) {
            const numericParts = rawLines[lineIndex].split(' ').map(segment => Number(segment));
            linkRecords.push(numericParts);
        }
        return { totalVertices, linkRecords };
    };

    const createAdjacencyMap = (nodeCount, connectivityData) => {
        const graphModel = new Map();
        for (let nodeIdx = 0; nodeIdx < nodeCount; ++nodeIdx) {
            graphModel.set(nodeIdx, []);
        }
        for (const [firstNode, secondNode, edgeAttribute] of connectivityData) {
            const adjustedFirst = firstNode - 1;
            const adjustedSecond = secondNode - 1;
            const attributeBit = edgeAttribute & 1;
            graphModel.get(adjustedFirst).push({ neighbor: adjustedSecond, property: attributeBit });
            graphModel.get(adjustedSecond).push({ neighbor: adjustedFirst, property: attributeBit });
        }
        return graphModel;
    };

    const propagateVertexValues = (
        currentVertexIdentifier,
        currentVertexValue,
        graphRepresentation,
        assignedVertexValues
    ) => {
        if (assignedVertexValues.has(currentVertexIdentifier)) {
            return;
        }
        assignedVertexValues.set(currentVertexIdentifier, currentVertexValue);

        const connectedNeighbors = graphRepresentation.get(currentVertexIdentifier) || [];
        for (const { neighbor, property } of connectedNeighbors) {
            if (!assignedVertexValues.has(neighbor)) {
                const nextVertexValue = currentVertexValue ^ property;
                propagateVertexValues(neighbor, nextVertexValue, graphRepresentation, assignedVertexValues);
            }
        }
    };

    const processGraphColoring = (allInputContent) => {
        const { totalVertices, linkRecords } = obtainInputData(allInputContent);
        const structuralMap = createAdjacencyMap(totalVertices, linkRecords);
        const finalValueRegistry = new Map();

        propagateVertexValues(0, 0, structuralMap, finalValueRegistry);

        const orderedResults = [];
        for (let i = 0; i < totalVertices; ++i) {
            orderedResults.push(finalValueRegistry.get(i));
        }
        return orderedResults.join('\n');
    };

    console.log(processGraphColoring(require('fs').readFileSync('/dev/stdin', 'utf8')));
})();