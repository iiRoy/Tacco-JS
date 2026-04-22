const sourceMatter = require("fs").readFileSync("/dev/stdin", "utf8");
const lineSequence = sourceMatter.split("\n");

const itemCount = parseInt(lineSequence[0], 10);

const itemRegistry = lineSequence.slice(1, 1 + itemCount).map(segment => {
    const segmentParts = segment.split(" ");
    return {
        worth: parseInt(segmentParts[0], 10),
        load: parseInt(segmentParts[1], 10)
    };
});

let currentPositionInInput = 1 + itemCount;
const requestCount = parseInt(lineSequence[currentPositionInInput++], 10);

const requestCollection = lineSequence.slice(currentPositionInInput, currentPositionInInput + requestCount).map(segment => {
    const segmentParts = segment.split(" ");
    return {
        startingNode: parseInt(segmentParts[0], 10) - 1,
        capacityLimit: parseInt(segmentParts[1], 10)
    };
});

function deriveAggregateValue(initialNode, capacityConstraint, availableItems) {
    function recursiveTraversal(currentNodeIndex, currentAccumulatedWorth, currentAccumulatedMass) {
        // If the accumulated mass (from previous steps) already exceeds the capacity limit,
        // we cannot add any more items from this path, so return the current worth.
        if (currentAccumulatedMass > capacityConstraint) {
            return currentAccumulatedWorth;
        }

        // Base case: Invalid index or out of bounds for the item registry.
        // This also covers cases where initialNode might be -1 after subtraction.
        if (currentNodeIndex < 0 || currentNodeIndex >= availableItems.length) {
            return currentAccumulatedWorth;
        }

        const componentInFocus = availableItems[currentNodeIndex];

        let nextAccumulatedMass = currentAccumulatedMass + componentInFocus.load;
        let nextAccumulatedWorth = currentAccumulatedWorth;

        // Only add the worth of the current component if the *new* total mass
        // remains within the allowed capacity.
        if (nextAccumulatedMass <= capacityConstraint) {
            nextAccumulatedWorth += componentInFocus.worth;
        }

        // Base case: If we have processed the component at index 0 (the conceptual root),
        // we stop the upward traversal.
        if (currentNodeIndex === 0) {
            return nextAccumulatedWorth;
        }

        // Recursive step: Move to the "parent" node by integer division.
        const nextNodeIndex = Math.floor(currentNodeIndex / 2);
        return recursiveTraversal(nextNodeIndex, nextAccumulatedWorth, nextAccumulatedMass);
    }

    // Initiate the recursive traversal starting from the initial node,
    // with no accumulated worth or mass yet.
    return recursiveTraversal(initialNode, 0, 0);
}

const finalOutcomes = requestCollection.map(request => {
    return deriveAggregateValue(request.startingNode, request.capacityLimit, itemRegistry);
});

finalOutcomes.forEach(outcome => console.log(outcome));