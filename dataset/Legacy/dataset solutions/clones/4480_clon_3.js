function ProcessInput(rawData) {
    var parsedLines = rawData.split("\n");
    var firstLineData = parsedLines[0].split(" ");
    var elementCount = Number(firstLineData[0]);
    var numericalValues = parsedLines[1].split(" ").map(Number);

    var totalSumOfElements = 0;
    for (var elementIndex = 0; elementIndex < elementCount; elementIndex++) {
        totalSumOfElements += numericalValues[elementIndex];
    }

    var currentLeftPartitionSum = 0;
    var currentRightPartitionSum;
    var minimumAbsoluteDifference = Infinity;

    // Iterate through all possible split points.
    // 'splitPointIdx' represents the number of elements in the left partition.
    // So, the left partition includes elements from index 0 to (splitPointIdx - 1).
    // The loop runs from 1 up to (elementCount - 1) to ensure both partitions have at least one element.
    for (var splitPointIdx = 1; splitPointIdx < elementCount; splitPointIdx++) {
        // Incrementally update the sum of the left partition.
        // This adds the element that moves from the right partition to the left.
        currentLeftPartitionSum += numericalValues[splitPointIdx - 1];
        
        // The sum of the right partition is the total sum minus the left partition's sum.
        currentRightPartitionSum = totalSumOfElements - currentLeftPartitionSum;

        var calculatedDifference = Math.abs(currentLeftPartitionSum - currentRightPartitionSum);

        // Update the minimum difference if the current one is smaller.
        if (calculatedDifference < minimumAbsoluteDifference) {
            minimumAbsoluteDifference = calculatedDifference;
        }
    }
    
    console.log(minimumAbsoluteDifference);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
