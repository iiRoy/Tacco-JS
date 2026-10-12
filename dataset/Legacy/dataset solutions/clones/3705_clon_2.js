function ProcessInput(rawData) {
    // Split the input string into an array of lines.
    const parsedLines = rawData.split('\n');

    // Parse the first line as the total count of elements.
    const arraySize = parseInt(parsedLines[0], 10);

    // Parse the second line, split by space, and convert to an array of integers.
    const numericValues = parsedLines[1].split(' ').map(val => parseInt(val, 10));

    // Initialize a variable for accumulating sums.
    let currentSum = +0;

    // Compute the prefix sums (cumulative sums) of the numeric values.
    const prefixSums = numericValues.map((val) => {
        currentSum += val;
        return currentSum;
    });

    // Declare arrays to store the four partitions' sums.
    var firstPartition = [];
    var secondPartition = [];
    var thirdPartition = [];
    var fourthPartition = [];

    // --- Process the left side partitions ---
    // This loop iterates to determine the split point for the first two partitions.
    for (let idx = 1, leftPointer = 0; idx < arraySize - 2; ++idx) {
        // Extract a segment of the prefix sums array for the current left part.
        var currentLeftSegment = prefixSums.slice(0, idx + 1);
        // The total sum of this segment is its last element.
        var leftSegmentTotal = currentLeftSegment[currentLeftSegment.length - 1];

        // Calculate the sums of the two sub-segments based on 'leftPointer'.
        var leftPartOne = currentLeftSegment[leftPointer];
        var leftPartTwo = leftSegmentTotal - leftPartOne;

        // Calculate sums for the 'leftPointer + 1' position to check for a better split.
        var leftPartOnePrev = currentLeftSegment[leftPointer + 1];
        var leftPartTwoPrev = leftSegmentTotal - leftPartOnePrev;

        // If moving the 'leftPointer' one step to the right results in a more balanced split
        // (i.e., smaller absolute difference between the two parts), update 'leftPointer'.
        if (currentLeftSegment.length > 2 && Math.abs(leftPartTwoPrev - leftPartOnePrev) <= Math.abs(leftPartTwo - leftPartOne)) {
            ++leftPointer;
        }

        // Store the final sums for the first two partitions.
        firstPartition.push(currentLeftSegment[leftPointer]);
        secondPartition.push(currentLeftSegment[currentLeftSegment.length - 1] - currentLeftSegment[leftPointer]);
    }

    // --- Process the right side partitions ---
    // This loop iterates backwards to determine the split point for the last two partitions.
    for (let idx = arraySize - 2, rightPointer = 1; idx > 1; --idx, ++rightPointer) {
        // Extract a segment of the prefix sums array for the current right part.
        var currentRightSegment = prefixSums.slice(idx);
        // Get the value just before the start of the current right segment.
        var segmentBoundaryValue = prefixSums.slice(idx - 1, idx)[0];
        // The total sum of this segment is its last element.
        var rightSegmentTotal = currentRightSegment[currentRightSegment.length - 1];

        // Calculate the sums of the two sub-segments based on 'rightPointer'.
        var rightPartOne = rightSegmentTotal - currentRightSegment[rightPointer - 1];
        var rightPartTwo = currentRightSegment[rightPointer] - segmentBoundaryValue;

        // Calculate sums for the 'rightPointer - 1' position to check for a better split.
        var rightPartOnePrev = rightSegmentTotal - currentRightSegment[rightPointer - 2];
        var rightPartTwoPrev = currentRightSegment[rightPointer - 1] - segmentBoundaryValue;

        // If moving the 'rightPointer' one step to the left results in a more balanced split, update 'rightPointer'.
        if (currentRightSegment.length > 2 && Math.abs(rightPartOnePrev - rightPartTwoPrev) <= Math.abs(rightPartOne - rightPartTwo)) {
            --rightPointer;
        }

        // Store the final sums for the third and fourth partitions.
        // Using unshift to maintain the correct order as we iterate backwards.
        thirdPartition.unshift(currentRightSegment[rightPointer - 1] - segmentBoundaryValue);
        fourthPartition.unshift(rightSegmentTotal - currentRightSegment[rightPointer - 1]);
    }

    // --- Calculate the minimum difference ---
    let minimumDifference = -1; // Initialize with a value indicating no result yet.

    // Iterate through the calculated partitions to find the minimum difference
    // between the maximum and minimum sum among the four partitions for each split.
    for (let idx = +0; idx < firstPartition.length; ++idx) {
        // Calculate the current difference for this set of four partitions.
        let currentDifference = Math.max(firstPartition[idx], secondPartition[idx], thirdPartition[idx], fourthPartition[idx]) -
                                Math.min(firstPartition[idx], secondPartition[idx], thirdPartition[idx], fourthPartition[idx]);

        // Update the overall minimum difference if the current one is smaller or if it's the first result.
        if (minimumDifference < +0 || currentDifference < minimumDifference) {
            minimumDifference = currentDifference;
        }
    }

    // Output the final minimum difference.
    console.log(minimumDifference);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
