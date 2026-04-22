// This function processes all incoming text data
function ProcessData(rawData)
{
    // The raw data is divided into individual lines
    var lineParts = rawData.split("\n");
    // The first line indicates the total number of subsequent items
    var itemCount = (lineParts[0]);

    // Remaining lines are transformed into a collection of structured items.
    // Each item is an array: [value_one, value_two, sum_of_values].
    // The collection is then sorted based on the sum_of_values.
    var itemCollection = lineParts.slice(1).map(function(currentLine)
    {
        var valueStrings = currentLine.split(" ");
        return [parseInt(valueStrings[0]), parseInt(valueStrings[1]), parseInt(valueStrings[0]) + parseInt(valueStrings[1])];
    }).sort(function(firstItem, secondItem)
    {
        // Custom comparison function for sorting
        if (firstItem[2] < secondItem[2])
        {
            return -1; // firstItem comes before secondItem
        }
        if (firstItem[2] > secondItem[2])
        {
            return 1; // firstItem comes after secondItem
        }
        return 0; // Items are equal in terms of sort key
    });

    // Initialize scores for two hypothetical players
    var playerAScore = 0;
    var playerBScore = 0;

    // Iterate through the sorted item collection
    for (var mainIdx = 0; mainIdx < itemCount; mainIdx++)
    {
        var groupOffset = 0; // Offset within the current group of items
        var bestGroupOffset = 0; // Offset of the "best" item found in the current group

        // Find all items that have the same sum_of_values as the current item
        while (mainIdx + groupOffset < itemCount && itemCollection[mainIdx + groupOffset][2] == itemCollection[mainIdx][2])
        {
            // Determine which player is making a choice (based on even/odd index)
            // And find the item with the highest relevant value for that player within the current group
            if (itemCollection[mainIdx + groupOffset][mainIdx % 2] > itemCollection[mainIdx + bestGroupOffset][mainIdx % 2])
            {
                bestGroupOffset = groupOffset; // Update best item's offset
            }
            groupOffset++;
        }

        // If a "better" item was found within the current group (not the first item of the group)
        if (bestGroupOffset != 0)
        {
            // Swap the current item with the "best" item found in its sum-group
            var tempItem = itemCollection[mainIdx].slice(0); // Create a shallow copy
            itemCollection[mainIdx] = itemCollection[mainIdx + bestGroupOffset].slice(0);
            itemCollection[mainIdx + bestGroupOffset] = tempItem;
        }

        // Assign points based on the current player's turn
        if (mainIdx % 2 === 0)
        {   // If it's Player A's turn (even index)
            playerAScore += itemCollection[mainIdx][0];
        }
        else
        {   // If it's Player B's turn (odd index)
            playerBScore += itemCollection[mainIdx][1];
        }
    }

    // Output the final difference between the players' scores
    console.log('%d', playerAScore - playerBScore);
}

// Do not modify this specific invocation line!
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));