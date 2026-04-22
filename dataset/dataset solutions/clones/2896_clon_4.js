const computeSystemMetric = (sourceText) => {
    const rawLines = sourceText.trim().split(/\s*[\r\n]+\s*/);

    const itemCount = Number(rawLines[0]);

    const linkages = rawLines.slice(1, -1).map(line => {
        const pairElements = line.split(/\s+/).map(Number);
        return pairElements.sort((a, b) => a - b);
    });

    const initialQuantities = rawLines[rawLines.length - 1].split(/\s+/).map(Number)
        .sort((a, b) => b - a)
        .slice(0, itemCount);

    const nodeToLinkMap = linkages.reduce((acc, link) => {
        const primaryNode = link[0];
        if (!acc.has(primaryNode)) {
            acc.set(primaryNode, []);
        }
        acc.get(primaryNode).push(link);
        return acc;
    }, new Map());

    const categorizedLinkGroups = Array.from(nodeToLinkMap.values());

    categorizedLinkGroups.sort((groupA, groupB) => groupA.length - groupB.length);

    const sequencedLinks = categorizedLinkGroups.flat();

    const initialCalculationState = {
        totalScore: 0,
        nodeValueRegistry: new Map(),
        quantityPoolIndex: 0,
        sourceQuantities: initialQuantities
    };

    const finalState = sequencedLinks.reduce((state, currentLink) => {
        let { totalScore, nodeValueRegistry, quantityPoolIndex, sourceQuantities } = state;
        const [firstNode, secondNode] = currentLink;

        if (!nodeValueRegistry.has(firstNode)) {
            nodeValueRegistry.set(firstNode, sourceQuantities[quantityPoolIndex]);
            quantityPoolIndex++;
        }

        if (!nodeValueRegistry.has(secondNode)) {
            nodeValueRegistry.set(secondNode, sourceQuantities[quantityPoolIndex]);
            quantityPoolIndex++;
        }

        const val1 = nodeValueRegistry.get(firstNode);
        const val2 = nodeValueRegistry.get(secondNode);
        totalScore += Math.min(val1, val2);

        return { totalScore, nodeValueRegistry, quantityPoolIndex, sourceQuantities };
    }, initialCalculationState);

    return `${finalState.totalScore}\n${initialQuantities.join(" ")}`;
};

console.log(computeSystemMetric(require("fs").readFileSync("/dev/stdin", "utf8")));