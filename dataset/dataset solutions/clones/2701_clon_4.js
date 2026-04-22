function parseNumericSequence(textualInput) {
    return textualInput.split(" ").map(Number);
}

function computeOverallValue(rawTextualData) {
    const dataSegments = rawTextualData.split("\n");
    let initialResourcePool = parseNumericSequence(dataSegments[1]);
    const requiredAmounts = parseNumericSequence(dataSegments[2]);

    function recursivelyCalculate(currentSegmentIndex, evolvingResourcePool, accumulatedResult) {
        // If the accumulated result has become NaN at any point, propagate it immediately.
        if (isNaN(accumulatedResult)) {
            return NaN;
        }
        // Base case: all segments have been processed.
        if (currentSegmentIndex >= requiredAmounts.length) {
            return accumulatedResult;
        }

        const currentTargetRequirement = requiredAmounts[currentSegmentIndex];
        let currentSegmentResource = evolvingResourcePool[currentSegmentIndex];
        let nextSegmentResource = evolvingResourcePool[currentSegmentIndex + 1]; // This can be undefined

        let segmentContribution = 0;
        let nextIterationResourcePool = [...evolvingResourcePool]; // Create a fresh copy for modifications

        if (currentSegmentResource >= currentTargetRequirement) {
            // Scenario 1: The current segment's resources are sufficient for the target requirement.
            segmentContribution = currentTargetRequirement;
            // No modification to the next segment's resource is needed in this case.
        } else {
            // Scenario 2 & 3: Current segment's resources are insufficient.
            const remainingRequirement = currentTargetRequirement - currentSegmentResource;

            // In JavaScript, (number <= undefined) evaluates to false. This mimics the original's conditional behavior.
            if (remainingRequirement <= nextSegmentResource) {
                // Scenario 2: Current segment + next segment resources are sufficient.
                segmentContribution = currentTargetRequirement;
                nextIterationResourcePool[currentSegmentIndex + 1] = nextSegmentResource - remainingRequirement;
            } else {
                // Scenario 3: Both current and next segment resources are insufficient.
                // If nextSegmentResource is undefined, 'currentSegmentResource + undefined' results in NaN,
                // precisely mirroring the original's behavior.
                segmentContribution = currentSegmentResource + nextSegmentResource;

                // The original code sets a[i+1] = 0 even if a[i+1] was undefined, effectively extending the array
                // or filling a sparse index with 0. We replicate this.
                nextIterationResourcePool[currentSegmentIndex + 1] = 0;
            }
        }
        // Recursively call the function for the next segment, passing the updated state.
        return recursivelyCalculate(currentSegmentIndex + 1, nextIterationResourcePool, accumulatedResult + segmentContribution);
    }

    // Initiate the recursive calculation from the first segment (index 0) with an initial total of 0.
    return recursivelyCalculate(0, initialResourcePool, 0);
}

// Read input from standard input, trim whitespace, and pass to the main processing function.
const finalOutcome = computeOverallValue(require("fs").readFileSync("/dev/stdin", "utf8").trim());
console.log(finalOutcome);