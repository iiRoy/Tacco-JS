(function(rawTextContent) {
    const extractProblemParameters = (sourceText) => {
        const contentLines = sourceText.trim().split('\n');
        const firstLineValues = contentLines[0].split(' ').map(Number);
        const secondLineValues = contentLines[1].split(' ').map(Number);
        return {
            totalActions: firstLineValues[0],
            actionSequence: secondLineValues
        };
    };

    const { totalActions, actionSequence } = extractProblemParameters(rawTextContent);

    const MODULO_VALUE = 1000000007;

    const initialComputationState = {
        itemDisposition: new Map([[0, 3]]), // Represents counts of items at various levels. Initially, 3 items at level 0.
        cumulativeFactor: 1
    };

    const finalComputationState = actionSequence.reduce((acc, currentActionLevel) => {
        const currentItemDisposition = acc.itemDisposition;
        const currentFactor = acc.cumulativeFactor;

        // Determine how many items are at the current level for this action
        const itemsPresentAtLevel = currentItemDisposition.get(currentActionLevel) || 0;

        // Update the cumulative factor
        const nextFactor = (currentFactor * itemsPresentAtLevel) % MODULO_VALUE;

        // Create a new Map for the next state to maintain functional purity (avoid direct mutation)
        const nextItemDisposition = new Map(currentItemDisposition);
        
        // Decrement count at the current level
        nextItemDisposition.set(currentActionLevel, itemsPresentAtLevel - 1);
        
        // Increment count at the next level (currentActionLevel + 1)
        const itemsPresentAtNextLevel = nextItemDisposition.get(currentActionLevel + 1) || 0;
        nextItemDisposition.set(currentActionLevel + 1, itemsPresentAtNextLevel + 1);

        return {
            itemDisposition: nextItemDisposition,
            cumulativeFactor: nextFactor
        };
    }, initialComputationState);

    return String(finalComputationState.cumulativeFactor);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));