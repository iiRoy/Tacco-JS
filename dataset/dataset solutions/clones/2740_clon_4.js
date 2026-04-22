function ProcessBallGame(sourceText) {
    const textLines = sourceText.trim().split('\n');
    const overallCapacity = Number(textLines[0]);
    const initialConfiguration = textLines[1].split(' ').map(Number);

    const calculatedParities = new Map();
    const activatedPositions = new Set();

    // Iterate through positions in descending order, from overallCapacity down to 1
    Array.from({ length: overallCapacity }, (_, index) => overallCapacity - index).forEach(currentPosition => {
        // Calculate the sum (modulo 2) of parities of positions that are multiples of currentPosition
        // and have already been calculated (i.e., are greater than currentPosition).
        const sumOfHigherMultiplesParity = Array.from(
            { length: Math.floor(overallCapacity / currentPosition) - 1 },
            (_, multiplierIndex) => (multiplierIndex + 2) * currentPosition
        ).reduce((accumulator, dependentPosition) => {
            // Retrieve the previously calculated parity for the dependent position
            // Use 0 as default if not found (should not happen with correct iteration order)
            return (accumulator + (calculatedParities.get(dependentPosition) || 0)) % 2;
        }, 0);

        // Determine the parity for the currentPosition based on its initial state
        // and the sum of parities of its higher multiples.
        const currentPositionFinalParity = (sumOfHigherMultiplesParity + initialConfiguration[currentPosition - 1]) % 2;

        // Store the calculated parity for the current position
        calculatedParities.set(currentPosition, currentPositionFinalParity);

        // If the final parity for this position is 1, add it to the set of activated positions
        if (currentPositionFinalParity === 1) {
            activatedPositions.add(currentPosition);
        }
    });

    // Output the count of activated positions
    console.log(activatedPositions.size);

    // If there are activated positions, output them space-separated and sorted numerically
    if (activatedPositions.size > 0) {
        console.log(Array.from(activatedPositions).sort((a, b) => a - b).join(" "));
    }
}

// This section handles standard input/output and should not be modified by the problem solver.
ProcessBallGame(require("fs").readFileSync("/dev/stdin", "utf8"));