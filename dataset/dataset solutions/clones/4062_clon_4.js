function solveSystem(systemInput) {
    const rawLines = systemInput.trim().split("\n");

    const [entityCount, relationCount] = rawLines[0].split(" ").map(Number);

    const relationList = [];
    for (let k = 1; k <= relationCount; k++) {
        const [nodeA, nodeB, valueDifference] = rawLines[k].split(" ").map(Number);
        relationList.push({ first: nodeA, second: nodeB, diff: valueDifference });
    }

    const componentParents = new Map();
    const relativeOffsets = new Map();

    for (let e = 1; e <= entityCount; e++) {
        componentParents.set(e, e);
        relativeOffsets.set(e, 0);
    }

    const findComponentRoot = (currentNode) => {
        if (componentParents.get(currentNode) === currentNode) {
            return { rootNode: currentNode, cumulativeOffset: 0 };
        }

        const parentOfCurrent = componentParents.get(currentNode);
        const { rootNode: actualRoot, cumulativeOffset: offsetFromParentRoot } = findComponentRoot(parentOfCurrent);

        componentParents.set(currentNode, actualRoot);
        relativeOffsets.set(currentNode, relativeOffsets.get(currentNode) + offsetFromParentRoot);

        return { rootNode: actualRoot, cumulativeOffset: relativeOffsets.get(currentNode) };
    };

    const uniteComponents = (nodeX, nodeY, desiredDiff) => {
        const { rootNode: rootX, cumulativeOffset: offsetFromXToRoot } = findComponentRoot(nodeX);
        const { rootNode: rootY, cumulativeOffset: offsetFromYToRoot } = findComponentRoot(nodeY);

        if (rootX === rootY) {
            return (offsetFromYToRoot - offsetFromXToRoot === desiredDiff);
        } else {
            componentParents.set(rootY, rootX);
            relativeOffsets.set(rootY, desiredDiff - offsetFromYToRoot + offsetFromXToRoot);
            return true;
        }
    };

    for (const currentRelation of relationList) {
        if (!uniteComponents(currentRelation.first, currentRelation.second, currentRelation.diff)) {
            console.log("No");
            return;
        }
    }

    console.log("Yes");
}

solveSystem(require("fs").readFileSync("/dev/stdin", "utf8"));