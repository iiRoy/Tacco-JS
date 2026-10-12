let elevations = [1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922]; // Initial list of various heights

// Sort the array of elevations in descending order using a custom comparison function.
let orderedPeaks = elevations.sort(compareValuesDescending);

// Iterate through the first three elements of the sorted array and print them.
for (let idx = 0; idx !== 3; idx++) {
    console.log(orderedPeaks[idx]);
}

/**
 * Compares two numeric values for sorting in descending order.
 * @param {number} firstVal - The first value for comparison.
 * @param {number} secondVal - The second value for comparison.
 * @returns {number} A negative value if secondVal is greater, a positive value if firstVal is greater, or zero if they are equal.
 */
function compareValuesDescending(firstVal, secondVal) {
    return secondVal - firstVal;
}
