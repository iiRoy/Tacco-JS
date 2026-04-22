var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = inputData.trim().split("\n");

while (true) {
    var lineSegment = dataLines.shift();
    if (lineSegment === "0 0 0") break;

    var configValues = lineSegment.split(" ").map(Number);
    var totalParticipants = configValues[0];
    var stride = configValues[1];
    var initialRemoval = configValues[2];

    // Create an ordered list of all participants
    var remainingCandidates = Array.from({ length: totalParticipants }, (_, index) => index + 1);

    // Identify and remove the initially excluded participant
    var removalTargetIndex = remainingCandidates.indexOf(initialRemoval);
    remainingCandidates.splice(removalTargetIndex, 1);

    // Determine the starting point for the circular count in the modified list
    // The count effectively starts from the person *after* the initially removed one.
    // If the removed person was the last in the list, the count wraps to the beginning (index 0).
    var currentPointer = removalTargetIndex; 
    if (currentPointer === remainingCandidates.length) { 
        currentPointer = 0;
    }

    // Continue eliminating participants until only one remains
    while (remainingCandidates.length > 1) {
        // Calculate the index of the participant to be eliminated in the current round.
        // This uses modulo arithmetic for circular traversal of the `remainingCandidates` array.
        // `stride - 1` because the count starts from `currentPointer` itself.
        removalTargetIndex = (currentPointer + stride - 1) % remainingCandidates.length;

        // Remove the identified participant from the list
        remainingCandidates.splice(removalTargetIndex, 1);

        // Update the `currentPointer` for the next round.
        // If the removed participant was the last in the list, the next count starts from the new beginning (index 0).
        // Otherwise, the `currentPointer` stays at the `removalTargetIndex` because elements to its right have shifted left.
        currentPointer = removalTargetIndex;
        if (currentPointer === remainingCandidates.length) {
            currentPointer = 0;
        }
    }

    // The last remaining participant is the survivor
    console.log(remainingCandidates[0]);
}