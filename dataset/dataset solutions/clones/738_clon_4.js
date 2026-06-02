var lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

while (true) {
    var currentEntry = lines.shift();
    if (currentEntry === "0 0 0") break;

    var [totalCount, stepSize, initialTarget] = currentEntry.split(" ").map(Number);

    let activeMembers = Array.from({ length: totalCount }, (_, index) => index + 1);

    // First, remove the 'initialTarget' member as per the original logic.
    // The original code sets ary[start] to false and increments cnt.
    let firstRemovalIndex = activeMembers.indexOf(initialTarget);
    activeMembers.splice(firstRemovalIndex, 1);

    // The next counting starts from the position immediately after the removed member.
    // If the removed member was the last in the current circle, it wraps to the beginning.
    let currentPointer = firstRemovalIndex % activeMembers.length;

    // Continue removing members until only one remains.
    // We've already removed one, so we need to remove (totalCount - 1) - 1 more.
    for (let removalIteration = 0; removalIteration < totalCount - 2; removalIteration++) {
        // Calculate the index of the member to be removed.
        // (stepSize - 1) because 'stepSize' means taking 'stepSize-1' steps from the current position.
        currentPointer = (currentPointer + stepSize - 1) % activeMembers.length;
        activeMembers.splice(currentPointer, 1);

        // Adjust the current pointer for the next iteration.
        // If the removed member was the last one, the pointer wraps to 0.
        // Otherwise, it stays at the same logical position (which is now the start of the next count).
        currentPointer = currentPointer % activeMembers.length;
    }

    // The last remaining member is the one left in the array.
    console.log(activeMembers[0]);
}
