function EntryPoint(rawInput) {
    const relationshipLines = rawInput.split(/\n/).slice(1);
    const nodeParents = new Map();
    const nodeOffsets = new Map(); // nodeOffsets.get(id) = value[id] - value[nodeParents.get(id)]

    let overallConsistency = true;

    function findNodeRepresentative(nodeIdentifier) {
        if (!nodeParents.has(nodeIdentifier)) {
            nodeParents.set(nodeIdentifier, nodeIdentifier);
            nodeOffsets.set(nodeIdentifier, 0);
            return [nodeIdentifier, 0]; // [root_node_id, value_relative_to_root]
        }

        let currentParent = nodeParents.get(nodeIdentifier);
        if (currentParent === nodeIdentifier) {
            return [nodeIdentifier, 0];
        }

        let [root, offsetFromParent] = findNodeRepresentative(currentParent);
        nodeParents.set(nodeIdentifier, root);
        nodeOffsets.set(nodeIdentifier, nodeOffsets.get(nodeIdentifier) + offsetFromParent);
        return [root, nodeOffsets.get(nodeIdentifier)];
    }

    function reconcileRelationship(firstNode, secondNode, relativeDifference) { // secondNode = firstNode + relativeDifference
        let [rootOfFirst, offsetOfFirst] = findNodeRepresentative(firstNode);
        let [rootOfSecond, offsetOfSecond] = findNodeRepresentative(secondNode);

        if (rootOfFirst !== rootOfSecond) {
            nodeParents.set(rootOfSecond, rootOfFirst);
            // We want value[rootOfSecond] = value[rootOfFirst] + X
            // We know: value[secondNode] = value[firstNode] + relativeDifference
            // (value[rootOfSecond] + offsetOfSecond) = (value[rootOfFirst] + offsetOfFirst) + relativeDifference
            // value[rootOfSecond] = value[rootOfFirst] + offsetOfFirst + relativeDifference - offsetOfSecond
            nodeOffsets.set(rootOfSecond, offsetOfFirst + relativeDifference - offsetOfSecond);
            return true;
        } else {
            // Check consistency: value[secondNode] = value[firstNode] + relativeDifference
            // (value[rootOfFirst] + offsetOfSecond) === (value[rootOfFirst] + offsetOfFirst) + relativeDifference
            // offsetOfSecond === offsetOfFirst + relativeDifference
            return offsetOfSecond === offsetOfFirst + relativeDifference;
        }
    }

    for (const currentLine of relationshipLines) {
        if (!overallConsistency) break;
        const [nodeA, nodeB, diffVal] = currentLine.split(/\s/).map(Number);
        if (!reconcileRelationship(nodeA, nodeB, diffVal)) {
            overallConsistency = false;
        }
    }

    console.log(overallConsistency ? 'Yes' : 'No');
}

EntryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
