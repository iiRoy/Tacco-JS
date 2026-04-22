function processChallenge(inputContent) {
    const numericalInputs = inputContent.trim().split(/\s+/).map(x => BigInt(x));

    const firstQuantity = numericalInputs[0];  // Corresponds to original A
    const secondQuantity = numericalInputs[1]; // Corresponds to original B
    const thirdQuantity = numericalInputs[2];   // Corresponds to original C
    const fourthQuantity = numericalInputs[3];  // Corresponds to original D

    // Function to find the smallest integer 'k' such that k * stepValue >= targetValue
    // This is equivalent to Math.ceil(targetValue / stepValue) but implemented using binary search
    // and BigInt to handle potentially large numbers without precision issues.
    function locateMinimumIterations(targetValue, stepValue) {
        if (targetValue === 0n) return 0n;
        if (stepValue === 0n) return targetValue > 0n ? Infinity : 0n; // Should not happen with problem constraints (B, D > 0)
        
        let lowerBound = 1n;
        // A safe upper bound for iterations is targetValue itself (if stepValue is 1)
        // or (targetValue / stepValue) + 1. Using targetValue is simpler and sufficient.
        let upperBound = targetValue;
        let optimalResult = targetValue; // Initialize with a value that will be refined

        while (lowerBound <= upperBound) {
            const midPoint = lowerBound + (upperBound - lowerBound) / 2n; // Calculate midpoint using BigInt division

            // Check if 'midPoint' iterations are sufficient.
            // This multiplication now safely handles large numbers using BigInt.
            if (midPoint * stepValue >= targetValue) {
                optimalResult = midPoint; // This 'midPoint' might be the answer, or we can do better (fewer iterations)
                upperBound = midPoint - 1n; // Try to find a smaller number of iterations
            } else {
                lowerBound = midPoint + 1n; // 'midPoint' iterations are not enough, need more
            }
        }
        return optimalResult;
    }

    const requiredIterationsForThird = locateMinimumIterations(thirdQuantity, secondQuantity); // Equivalent to ceil(C/B)
    const requiredIterationsForFirst = locateMinimumIterations(firstQuantity, fourthQuantity); // Equivalent to ceil(A/D)

    if (requiredIterationsForThird <= requiredIterationsForFirst) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));