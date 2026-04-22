((rawTextStream) => {
    const numericalParts = rawTextStream.trim().split(/\s+/).map(Number);
    const extractNextValue = () => numericalParts.shift();

    const totalNodes = extractNextValue();
    const taroOrigin = extractNextValue() - 1;
    const aliceOrigin = extractNextValue() - 1;

    const networkConnections = new Map();
    for (let idx = 0; idx < totalNodes; ++idx) {
        networkConnections.set(idx, new Set());
    }

    for (let k = 0; k < totalNodes - 1; ++k) {
        const sourceNode = extractNextValue() - 1;
        const destinationNode = extractNextValue() - 1;
        networkConnections.get(sourceNode).add(destinationNode);
        networkConnections.get(destinationNode).add(sourceNode);
    }

    const calculateDistancesRecursive = (startNode) => {
        const distances = new Array(totalNodes).fill(-1);

        const traverse = (currentNode, currentDistance) => {
            if (distances[currentNode] !== -1) {
                return;
            }
            distances[currentNode] = currentDistance;

            for (const neighbor of networkConnections.get(currentNode)) {
                if (distances[neighbor] === -1) {
                    traverse(neighbor, currentDistance + 1);
                }
            }
        };

        traverse(startNode, 0);
        return distances;
    };

    const taroPathDistances = calculateDistancesRecursive(taroOrigin);
    const alicePathDistances = calculateDistancesRecursive(aliceOrigin);

    let maximumTaroAdvantage = -1;
    let minimumEqualPath = Number.POSITIVE_INFINITY;
    let equalityFound = false;

    for (let nodeIdentifier = 0; nodeIdentifier < totalNodes; ++nodeIdentifier) {
        const taroDistance = taroPathDistances[nodeIdentifier];
        const aliceDistance = alicePathDistances[nodeIdentifier];

        if (taroDistance < aliceDistance) {
            maximumTaroAdvantage = Math.max(maximumTaroAdvantage, taroDistance);
        } else if (taroDistance === aliceDistance) {
            equalityFound = true;
            minimumEqualPath = Math.min(minimumEqualPath, taroDistance);
        }
    }

    const finalCalculatedValue = equalityFound
        ? Math.max(maximumTaroAdvantage, minimumEqualPath)
        : maximumTaroAdvantage;

    console.log(finalCalculatedValue);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));