var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var [a,b,c]=input.trim().split(" ").map(Number);

if (c <= 0) {
    console.log(0);
} else {
    // Helper function to calculate total accumulation for a given number of days
    const computeAccumulation = (dayCount, dailyRate, weeklyBonus) => {
        // If dayCount is 0 or negative, accumulation is 0.
        if (dayCount <= 0) return 0;

        // Calculate the number of full 7-day cycles completed.
        // (dayCount - 1) is used because the first day is day 1, not day 0.
        // For dayCount 1-7, fullCycles = 0. For dayCount 8-14, fullCycles = 1, etc.
        const fullCycles = Math.floor((dayCount - 1) / 7);

        // Calculate the number of days within the current (possibly partial) cycle.
        // This will be a value from 1 to 7.
        const currentCycleDays = (dayCount - 1) % 7 + 1;

        // The total accumulation is the sum from all full cycles
        // plus the sum from the days in the current partial cycle.
        return fullCycles * (7 * dailyRate + weeklyBonus) + currentCycleDays * dailyRate;
    };

    let lowerBound = 1;
    // Establish an upper bound for the binary search.
    // A safe upper bound ensures that if a solution exists, it's within this range.
    // If 'a' is 0 and 'b' is positive, we might need 'c/b' weeks, so 'c/b * 7' days.
    // If 'a' is positive and 'b' is 0, we might need 'c/a' days.
    // Math.max(c, 1) * 7 + 7 covers these scenarios robustly.
    let upperBound = Math.max(c, 1) * 7 + 7;
    let finalDayCount = upperBound; // Initialize with the upper bound, will be updated to the smallest valid day

    // Perform a binary search to find the minimum number of days
    // required to reach or exceed the target accumulation 'c'.
    while (lowerBound <= upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        const currentAccumulation = computeAccumulation(midPoint, a, b);

        if (currentAccumulation >= c) {
            // If the target is met or exceeded, this 'midPoint' is a potential answer.
            // We store it and try to find an even smaller 'dayCount' by searching in the lower half.
            finalDayCount = midPoint;
            upperBound = midPoint - 1;
        } else {
            // If the target is not yet met, we need more days.
            // Search in the upper half.
            lowerBound = midPoint + 1;
        }
    }

    // After the binary search, 'finalDayCount' holds the smallest number of days
    // for which 'computeAccumulation' was >= 'c' within the search range.
    // We must verify if the target 'c' was actually reached.
    // This handles cases like (a=0, b=0, c>0) where the sum never increases,
    // which would result in an infinite loop in the original code.
    if (computeAccumulation(finalDayCount, a, b) < c) {
        // If the target was not met even at the 'finalDayCount', it implies
        // that the target 'c' is unreachable. In the original code, this
        // would lead to an infinite loop without any output.
        // Therefore, we produce no output in this scenario.
    } else {
        // If the target was successfully reached, print the result.
        console.log(finalDayCount);
    }
}
