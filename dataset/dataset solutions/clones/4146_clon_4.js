let processBuffer = '';

process.stdin.on('data', segment => {
    processBuffer += segment.toString();
});

process.stdin.on('end', () => {
    const numericalComponents = processBuffer.trim().split(/\s+/);
    const initialQuantity = Number(numericalComponents[0]);
    const maxThreshold = Number(numericalComponents[1]);

    let finalCount;

    if (initialQuantity <= 0) {
        if (initialQuantity === 0) {
            // Original behavior: If initial quantity is 0, it never increases.
            // If maxThreshold is non-negative, 0 <= maxThreshold is always true, leading to an infinite loop.
            // If maxThreshold is negative, 0 <= maxThreshold is false, result is 0.
            if (maxThreshold >= 0) {
                // Simulate infinite loop by not printing and terminating.
                return;
            } else {
                finalCount = 0;
            }
        } else { // initialQuantity < 0
            // Original behavior: If initial quantity is negative, multiplying by 2 keeps it negative and makes it more negative.
            // If initialQuantity <= maxThreshold initially, it will always remain <= maxThreshold (since it keeps decreasing),
            // leading to an infinite loop.
            // If initialQuantity > maxThreshold initially, the loop condition is false, result is 0.
            if (initialQuantity <= maxThreshold) {
                // Simulate infinite loop by not printing and terminating.
                return;
            } else {
                finalCount = 0;
            }
        }
    } else { // initialQuantity > 0
        // For positive numbers, the problem is equivalent to finding the largest integer 'k'
        // such that initialQuantity * 2^(k-1) <= maxThreshold.
        // This simplifies to k-1 <= log2(maxThreshold / initialQuantity), or k <= log2(maxThreshold / initialQuantity) + 1.
        // The Math.floor ensures 'k' is an integer.
        // This formula correctly yields 0 if initialQuantity > maxThreshold (e.g., log2(0.5) = -1, floor(-1)+1 = 0).
        finalCount = Math.floor(Math.log2(maxThreshold / initialQuantity)) + 1;
    }

    console.log(finalCount);
});