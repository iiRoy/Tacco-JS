function processInputRelations(fullInputString) {
    const ancestorRegistry = new Map();
    const relativeOffsets = new Map();

    function resolveComponent(nodeIdentifier) {
        if (!ancestorRegistry.has(nodeIdentifier)) {
            ancestorRegistry.set(nodeIdentifier, nodeIdentifier);
            relativeOffsets.set(nodeIdentifier, 0);
            return [nodeIdentifier, 0];
        }

        let currentParent = ancestorRegistry.get(nodeIdentifier);
        if (currentParent === nodeIdentifier) {
            return [nodeIdentifier, 0];
        }

        const [rootOfParent, offsetParentToRoot] = resolveComponent(currentParent);
        
        ancestorRegistry.set(nodeIdentifier, rootOfParent);
        relativeOffsets.set(nodeIdentifier, relativeOffsets.get(nodeIdentifier) + offsetParentToRoot);
        
        return [rootOfParent, relativeOffsets.get(nodeIdentifier)];
    }

    function integrateConstraint(primaryIdentifier, secondaryIdentifier, requiredDifference) {
        const [rootPrimary, offsetPrimary] = resolveComponent(primaryIdentifier);
        const [rootSecondary, offsetSecondary] = resolveComponent(secondaryIdentifier);

        if (rootPrimary !== rootSecondary) {
            ancestorRegistry.set(rootSecondary, rootPrimary);
            relativeOffsets.set(rootSecondary, requiredDifference - offsetSecondary + offsetPrimary);
            return true;
        } else {
            return (offsetSecondary - offsetPrimary) === requiredDifference;
        }
    }

    const statementLines = fullInputString.split(/\n/).slice(1);
    let allConsistent = true;

    for (const statement of statementLines) {
        if (statement.trim() === '') continue;
        const parts = statement.split(/\s/).map(Number);
        if (parts.length !== 3) continue;

        const p1 = parts[0];
        const p2 = parts[1];
        const p_diff = parts[2];
        
        if (!integrateConstraint(p1, p2, p_diff)) {
            allConsistent = false;
            break;
        }
    }

    return allConsistent ? 'Yes' : 'No';
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputRelations(inputData));