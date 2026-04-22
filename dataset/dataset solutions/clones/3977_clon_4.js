((inputStringValue) => {
    const numericData = inputStringValue.match(/\d+/g).map(Number);
    let dataPointer = 0;

    const quantity = numericData[dataPointer++];

    const initialNodes = Array.from({ length: quantity }, (_, posId) => ({
        xCoord: numericData[dataPointer++],
        yCoord: numericData[dataPointer++],
        uniqueId: posId
    }));

    const targetNodes = Array.from({ length: quantity }, (_, posId) => ({
        xCoord: numericData[dataPointer++],
        yCoord: numericData[dataPointer++],
        uniqueId: posId
    }));

    targetNodes.sort((firstNode, secondNode) => firstNode.xCoord - secondNode.xCoord);

    const matchingOutcome = targetNodes.reduce((accumulator, currentTargetNode) => {
        const { currentMatches, consumedNodeIdentities } = accumulator;

        const potentialInitialNodes = initialNodes.filter(node =>
            !consumedNodeIdentities.has(node.uniqueId) &&
            node.xCoord < currentTargetNode.xCoord &&
            node.yCoord < currentTargetNode.yCoord
        );

        if (potentialInitialNodes.length === 0) {
            return accumulator;
        }

        const optimalInitialNode = potentialInitialNodes.reduce((bestMatch, candidateNode) => {
            if (!bestMatch || candidateNode.yCoord > bestMatch.yCoord) {
                return candidateNode;
            }
            return bestMatch;
        }, null);

        if (optimalInitialNode) {
            consumedNodeIdentities.add(optimalInitialNode.uniqueId);
            return {
                currentMatches: currentMatches + 1,
                consumedNodeIdentities: consumedNodeIdentities
            };
        } else {
            return accumulator;
        }
    }, { currentMatches: 0, consumedNodeIdentities: new Set() });

    return `${matchingOutcome.currentMatches}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'));