function Main(input) {
    const inputLines = input.split("\r\n");
    const movementSequence = inputLines[0];
    const [targetCoordinateXString, targetCoordinateYString] = inputLines[1].split(" ");

    const finalTargetX = Number(targetCoordinateXString);
    const finalTargetY = Number(targetCoordinateYString);

    const pathSegments = movementSequence.split("T");

    // The initial segment of 'F's always moves forward along the X-axis.
    const initialForwardDistance = pathSegments[0].length;

    // Calculate the absolute remaining distance to the target after the initial unavoidable move.
    // For X, it's the difference from the initial forward position.
    // For Y, it's simply the absolute target Y, as initial movement is only X.
    const effectiveTargetX = Math.abs(finalTargetX - initialForwardDistance);
    const effectiveTargetY = Math.abs(finalTargetY);

    // Process the segments after the first 'T' to categorize them into X and Y movements.
    // Segments at even indices (0, 2, 4...) after the first 'T' correspond to X-axis turns.
    // Segments at odd indices (1, 3, 5...) after the first 'T' correspond to Y-axis turns.
    const { xDirectionalMoves, yDirectionalMoves } = pathSegments.slice(1).reduce(
        (accumulator, segmentLength, segmentIndex) => {
            const currentMoveLength = segmentLength.length;
            if (segmentIndex % 2 === 0) { // Even index after first 'T' -> X-axis
                accumulator.x.push(currentMoveLength);
            } else { // Odd index after first 'T' -> Y-axis
                accumulator.y.push(currentMoveLength);
            }
            return accumulator;
        },
        { x: [], y: [] }
    );

    // Calculate the total possible movement distance for each axis.
    const totalPossibleXMovement = xDirectionalMoves.reduce((sum, len) => sum + len, 0);
    const totalPossibleYMovement = yDirectionalMoves.reduce((sum, len) => sum + len, 0);

    // A utility function to determine if a specific 'distance' can be achieved
    // given a collection of 'movements' and their 'totalSum'.
    // This uses a dynamic programming approach with a Set to track all possible subset sums.
    const checkFeasibility = (availableMoves, requiredDistance, aggregateSum) => {
        // If the required distance exceeds the total possible movement, it's impossible.
        if (requiredDistance > aggregateSum) {
            return false;
        }
        // If the required distance exactly matches the total possible movement, it's achievable
        // by moving all segments in the forward direction.
        if (requiredDistance === aggregateSum) {
            return true;
        }

        // If requiredDistance < aggregateSum, some movements must be "reversed".
        // The total amount that needs to be effectively "canceled out" by reversing movements is (aggregateSum - requiredDistance).
        // Each reversed movement cancels out 2 units (1 forward, 1 backward).
        // Therefore, we need to find a subset of 'availableMoves' that sums to (aggregateSum - requiredDistance) / 2.
        const targetBacktrackSum = (aggregateSum - requiredDistance) / 2;

        // If the target backtrack sum is not a non-negative integer, it's impossible.
        if (targetBacktrackSum < 0 || targetBacktrackSum % 1 !== 0) {
            return false;
        }

        // Initialize a Set to store all unique sums that can be formed by subsets of 'availableMoves'.
        let achievableSums = new Set([0]); // 0 represents the sum achievable by choosing no moves.

        // Iterate through each movement length.
        for (const moveValue of availableMoves) {
            // Create a temporary array from the current achievable sums to avoid modifying the Set during iteration.
            const currentAchievableSums = Array.from(achievableSums);
            // For each sum currently achievable, add a new sum by including the current 'moveValue'.
            for (const existingSum of currentAchievableSums) {
                achievableSums.add(existingSum + moveValue);
            }
        }

        // Check if the calculated 'targetBacktrackSum' is present in the set of all achievable sums.
        return achievableSums.has(targetBacktrackSum);
    };

    // Determine if the effective target X and Y distances are reachable independently.
    const xReachable = checkFeasibility(xDirectionalMoves, effectiveTargetX, totalPossibleXMovement);
    const yReachable = checkFeasibility(yDirectionalMoves, effectiveTargetY, totalPossibleYMovement);

    // Output "Yes" if both X and Y targets are reachable, otherwise "No".
    if (xReachable && yReachable) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
