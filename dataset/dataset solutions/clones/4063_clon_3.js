function evaluateConstraintSystem(rawInputString) {
    // This function determines if a system of difference constraints is consistent.
    // It uses a propagation algorithm similar to a Breadth-First Search (BFS)
    // to assign relative values to points and check for contradictions.

    // --- Type II: Input parsing and initial setup (renaming, comments, whitespace) ---
    const inputLines = rawInputString.split("\n");

    // Guard clause: Ensure there are enough lines for N, M, and at least one constraint.
    if (inputLines.length < 2) {
        // If input is too short, it's malformed.
        console.error("Error: Insufficient input lines provided.");
        // In a real application, one might throw an error or handle this more gracefully.
        return;
    }

    // Parse the first line containing the total number of points and constraints.
    const firstLineNumericParts = inputLines[0].split(" ").map(Number);
    const totalPoints = firstLineNumericParts[0]; // Corresponds to original 'N'
    const totalConstraints = firstLineNumericParts[1]; // Corresponds to original 'M'

    // Type III: Use a Map for point values for more flexible and sparse representation
    // compared to a fixed-size array. Renamed 'x' to 'pointValueMap'.
    const pointValueMap = new Map(); // Stores computed values for points (e.g., pointValueMap.get(k) for x[k])

    // Type III: Store constraints as an array of objects for better readability and encapsulation,
    // instead of three separate L, R, D arrays.
    const constraintDetails = [];
    for (let i = 0; i < totalConstraints; ++i) {
        // Guard clause: Check if a constraint line is missing.
        if (i + 1 >= inputLines.length) {
            console.error(`Error: Missing data for constraint number ${i + 1}.`);
            return;
        }
        const currentConstraintParts = inputLines[i + 1].split(" ").map(Number);
        constraintDetails.push({
            leftPoint: currentConstraintParts[0],
            rightPoint: currentConstraintParts[1],
            difference: currentConstraintParts[2]
        });
    }

    let systemConsistent = true; // Renamed 'ans' to 'systemConsistent'.
    // Type III: Use a Set to efficiently track indices of constraints that haven't been fully processed yet.
    const unprocessedConstraintIndices = new Set(Array.from({ length: totalConstraints }, (_, idx) => idx));

    // --- Type III: Main processing loop (changed structure, flag for early exit) ---
    // The loop continues as long as there are constraints to process and no inconsistency has been found.
    while (unprocessedConstraintIndices.size > 0 && systemConsistent) {
        // Pick an arbitrary unprocessed constraint to start a new connected component.
        // Set.values().next().value gets the first element from the Set.
        const currentConstraintIndexToStart = unprocessedConstraintIndices.values().next().value;
        const initialConstraint = constraintDetails[currentConstraintIndexToStart];

        // Defensive check, though 'unprocessedConstraintIndices' should only contain valid indices.
        if (!initialConstraint) {
            unprocessedConstraintIndices.delete(currentConstraintIndexToStart);
            continue;
        }

        const initialLeftPoint = initialConstraint.leftPoint;
        const initialRightPoint = initialConstraint.rightPoint;
        const initialDifference = initialConstraint.difference;

        // Type III: Refined initial value assignment logic.
        // If both points in this initial constraint are unknown, assign an arbitrary base (e.g., 0)
        // to one, and derive the other. This establishes a reference for a new connected component.
        if (!pointValueMap.has(initialLeftPoint) && !pointValueMap.has(initialRightPoint)) {
            pointValueMap.set(initialLeftPoint, 0); // Arbitrary base value for a new component
            // Based on L - R = D => R = L - D
            pointValueMap.set(initialRightPoint, 0 - initialDifference);
        } else if (!pointValueMap.has(initialLeftPoint)) {
            // If only the right point has a value, calculate the left point's value.
            // L = R + D
            pointValueMap.set(initialLeftPoint, pointValueMap.get(initialRightPoint) + initialDifference);
        } else if (!pointValueMap.has(initialRightPoint)) {
            // If only the left point has a value, calculate the right point's value.
            // R = L - D
            pointValueMap.set(initialRightPoint, pointValueMap.get(initialLeftPoint) - initialDifference);
        } else {
            // Both points already have values (e.g., from a previously processed component).
            // Immediately check for consistency for this constraint.
            if (pointValueMap.get(initialLeftPoint) - pointValueMap.get(initialRightPoint) !== initialDifference) {
                systemConsistent = false;
                break; // Inconsistency found, exit main loop.
            }
        }

        // Type III: Use a Set for 'pointsToPropagate' (renamed 'ary') to avoid duplicate points
        // and process each unique point once per propagation phase.
        const pointsToPropagate = new Set();
        // Add the points from the initial constraint to the queue for propagation.
        pointsToPropagate.add(initialLeftPoint);
        pointsToPropagate.add(initialRightPoint);

        // Mark the initial constraint as processed.
        unprocessedConstraintIndices.delete(currentConstraintIndexToStart);

        // --- Type III: Propagation loop (rewritten using Set and explicit iteration) ---
        // This loop continues until no more values can be propagated or an inconsistency is found.
        while (pointsToPropagate.size > 0 && systemConsistent) {
            // Get a point from the propagation queue. Using Array.from().shift() effectively
            // treats the Set as a queue (FIFO), though Set iteration order is insertion order.
            const currentPropagatingPoint = Array.from(pointsToPropagate).shift();
            pointsToPropagate.delete(currentPropagatingPoint); // Remove it from the set.

            // Type III: To avoid issues with modifying 'unprocessedConstraintIndices' during iteration,
            // we will build a new set of unprocessed indices for the next iteration.
            const nextUnprocessedConstraintIndices = new Set();
            const constraintsToProcessInThisPass = [];

            // Iterate over the current set of unprocessed constraints to find those connected
            // to the 'currentPropagatingPoint'.
            for (const constraintIdx of unprocessedConstraintIndices) {
                const currentConstraint = constraintDetails[constraintIdx];
                if (currentConstraint.leftPoint === currentPropagatingPoint || currentConstraint.rightPoint === currentPropagatingPoint) {
                    constraintsToProcessInThisPass.push({ index: constraintIdx, data: currentConstraint });
                } else {
                    // If not connected to the current point, keep it for future iterations.
                    nextUnprocessedConstraintIndices.add(constraintIdx);
                }
            }

            // Now, process the collected connected constraints.
            for (const { index: constraintIdx, data: currentConstraint } of constraintsToProcessInThisPass) {
                if (!systemConsistent) break; // If an inconsistency was found, stop processing.

                let constraintFullyResolved = false;

                // Case 1: The propagating point is the left point of the current constraint.
                if (currentConstraint.leftPoint === currentPropagatingPoint) {
                    const knownLeftValue = pointValueMap.get(currentPropagatingPoint);
                    if (!pointValueMap.has(currentConstraint.rightPoint)) {
                        // If the right point is unknown, calculate its value. (R = L - D)
                        pointValueMap.set(currentConstraint.rightPoint, knownLeftValue - currentConstraint.difference);
                        pointsToPropagate.add(currentConstraint.rightPoint); // Add to queue for further propagation.
                    } else {
                        // Both points have values; check for consistency.
                        if (knownLeftValue - pointValueMap.get(currentConstraint.rightPoint) !== currentConstraint.difference) {
                            systemConsistent = false; // Inconsistency detected.
                        }
                    }
                }
                // Case 2: The propagating point is the right point of the current constraint.
                else if (currentConstraint.rightPoint === currentPropagatingPoint) {
                    const knownRightValue = pointValueMap.get(currentPropagatingPoint);
                    if (!pointValueMap.has(currentConstraint.leftPoint)) {
                        // If the left point is unknown, calculate its value. (L = R + D)
                        pointValueMap.set(currentConstraint.leftPoint, knownRightValue + currentConstraint.difference);
                        pointsToPropagate.add(currentConstraint.leftPoint); // Add to queue.
                    } else {
                        // Both points have values; check for consistency.
                        if (pointValueMap.get(currentConstraint.leftPoint) - knownRightValue !== currentConstraint.difference) {
                            systemConsistent = false; // Inconsistency detected.
                        }
                    }
                }

                // Check if both endpoints of this constraint now have values.
                if (pointValueMap.has(currentConstraint.leftPoint) && pointValueMap.has(currentConstraint.rightPoint)) {
                    constraintFullyResolved = true;
                }

                // If the constraint is not fully resolved (e.g., only one side was known, or it was not
                // directly connected to the current propagating point), it remains in the unprocessed set.
                if (!constraintFullyResolved) {
                    nextUnprocessedConstraintIndices.add(constraintIdx);
                }
            }
            // Update the set of unprocessed constraints for the next iteration.
            unprocessedConstraintIndices.clear(); // Clear old set
            nextUnprocessedConstraintIndices.forEach(idx => unprocessedConstraintIndices.add(idx)); // Add elements from new set
        }
    }

    // --- Type II: Output result ---
    console.log(systemConsistent ? "Yes" : "No");
}

// --- Type II: Rename the entry point for execution ---
// Reads input from standard input and passes it to the main processing function.
evaluateConstraintSystem(require("fs").readFileSync("/dev/stdin", "utf8"));