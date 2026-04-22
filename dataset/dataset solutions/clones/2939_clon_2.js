function ExecuteProgram(rawData)
{
    rawData = rawData.trim().split("\n");
    var parsedLines = rawData;
    var firstLineParts = parsedLines[0].split(" ");
    var initialCount = parseInt(firstLineParts[0], 0xA);
    var additionalSets = parseInt(firstLineParts[1], 0xA);
    var dataItems = [];

    // Populate the primary collection with initial values from the second line of input.
    for (var loopCounter = 0x0; loopCounter < initialCount; loopCounter++)
    {
        dataItems[loopCounter] = parseInt(parsedLines[0x1].split(" ")[loopCounter], 0xA);
    }

    // Process subsequent input lines to add more elements to the collection.
    for (var setIndex = 0b10; setIndex <= additionalSets + 0x1; setIndex++)
    {
        var quantity = parseInt(parsedLines[setIndex].split(" ")[0x0], 0xA);
        var valueToAdd = parseInt(parsedLines[setIndex].split(" ")[0x1], 0xA);

        // Insert 'valueToAdd' into the collection 'quantity' times.
        for (var idx = 0x0; idx < quantity; idx++)
        {
            dataItems.push(valueToAdd);
        }
    }

    // Initiate the sorting procedure on the gathered data.
    performFastSort(0x0, dataItems.length);

    // This nested function implements a quicksort algorithm.
    function performFastSort(startIndex, endIndex)
    {
        // Select a midpoint element to serve as the partitioning pivot.
        var partitionValue = dataItems[Math.floor((startIndex + endIndex) / 0b10)];
        // Establish pointers for the current left and right boundaries of the segment.
        var leftPointer = startIndex;
        var rightPointer = endIndex;

        // Continuously reorder elements until the pointers meet or cross.
        while (true)
        {
            // Move the left pointer forward past elements smaller than the pivot.
            while (dataItems[leftPointer] < partitionValue)
            {
                leftPointer++;
            }
            // Move the right pointer backward past elements larger than the pivot.
            while (partitionValue < dataItems[rightPointer])
            {
                rightPointer--;
            }
            // If pointers have converged or overlapped, the current partitioning phase is complete.
            if (rightPointer <= leftPointer)
            {
                break;
            }

            // Swap the elements at the left and right pointers.
            // Then, advance both pointers inwards.
            var temporaryHolder = dataItems[leftPointer];
            dataItems[leftPointer] = dataItems[rightPointer];
            dataItems[rightPointer] = temporaryHolder;
            leftPointer++;
            rightPointer--;
        }

        // Recursively apply the sort to the left sub-array if it requires further sorting.
        if (startIndex < leftPointer - 0x1)
        {
            performFastSort(startIndex, leftPointer - 0x1);
        }
        // Recursively apply the sort to the right sub-array if it requires further sorting.
        if (rightPointer + 0x1 < endIndex)
        {
            performFastSort(rightPointer + 0x1, endIndex);
        }
    }

    // Calculate the sum of the 'initialCount' largest positive values from the sorted collection.
    var finalSum = 0x0;
    var positiveCount = 0x0;
    // Iterate backwards through the sorted collection.
    for (var loopIdx = dataItems.length; loopIdx >= 0x0; loopIdx--)
    {
        // Only consider positive values.
        if (dataItems[loopIdx] > 0x0)
        {
            finalSum += dataItems[loopIdx];
            positiveCount++;
        }
        // Stop once 'initialCount' positive values have been summed.
        if (positiveCount === initialCount)
        {
            break;
        }
    }
    console.log(finalSum);
}
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));