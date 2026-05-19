process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputSegment) {
    processInputData(inputSegment);
});

var outputResult = console.log;

function processInputData(inputSegment) {
    var rawSegments = inputSegment.split("\n").reduce((accumulator, currentLine) => {
        if (currentLine !== "") {
            accumulator.push(currentLine);
        }
        return accumulator;
    }, []);
    computeGroupAverages(rawSegments);
}

function computeGroupAverages(rawSegments) {
    var numericSequence = [];
    for (let i = 0; i < rawSegments.length; i++) {
        numericSequence.push(Number(rawSegments[i]));
    }

    let currentPosition = 0;
    while (currentPosition < numericSequence.length) {
        // The original code's `while(ls.length > 1)` implies that there must be
        // at least one element for the groupCount and at least one element for the group itself.
        // If `currentPosition` is the last index, there are no elements to form a group.
        if (currentPosition + 1 >= numericSequence.length) {
            break;
        }

        const groupCount = numericSequence[currentPosition];
        
        // Extract the current group of numbers.
        // slice handles cases where `currentPosition + 1 + groupCount` is out of bounds
        // by taking elements up to the end of the array.
        let currentGroup = numericSequence.slice(currentPosition + 1, currentPosition + 1 + groupCount);
        
        // Core logic change: Sort the group and remove the smallest and largest elements.
        // This handles empty or single-element groups gracefully, resulting in an empty array.
        if (currentGroup.length > 0) {
            currentGroup.sort((valA, valB) => valA - valB);
            
            // Remove the smallest element
            currentGroup.shift();
            
            // Remove the largest element
            currentGroup.pop();
        }
        
        let groupSum = 0;
        // Calculate the sum of the remaining elements using a for...of loop.
        // For an empty array, groupSum will correctly be 0.
        for (const value of currentGroup) {
            groupSum += value;
        }
        
        // Calculate the average. If currentGroup is empty, length is 0,
        // resulting in 0/0 which is NaN, matching original behavior.
        outputResult(Math.floor(groupSum / currentGroup.length));
        
        // Advance the current position past the groupCount and all elements processed in this group.
        currentPosition += 1 + groupCount;
    }
}
