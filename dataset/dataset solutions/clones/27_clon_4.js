function determineSearchTreeValidity(startingNode) {
    function respectsLimits(
        inspectedNode,
        minimumAllowed,
        maximumAllowed
    ) {
        if (inspectedNode === null) {
            return true;
        }

        const currentValue = inspectedNode.value;

        if (
            currentValue <= minimumAllowed ||
            currentValue >= maximumAllowed
        ) {
            return false;
        }

        const leftSubtreeIsValid = respectsLimits(
            inspectedNode.left,
            minimumAllowed,
            currentValue
        );

        if (!leftSubtreeIsValid) {
            return false;
        }

        const rightSubtreeIsValid = respectsLimits(
            inspectedNode.right,
            currentValue,
            maximumAllowed
        );

        return rightSubtreeIsValid;
    }

    return respectsLimits(
        startingNode,
        -Infinity,
        Infinity
    );
}