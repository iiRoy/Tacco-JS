function ProcessInput(rawData) {
    // The raw input string is first cleaned:
    // 1. Trim leading/trailing whitespace.
    // 2. Split into an array of lines based on newline characters.
    // 3. Each line is then split into an array of strings based on space characters.
    let processedLines = rawData.trim().split('\n').map((lineContent) => {
        return lineContent.split(' ');
    });

    // Extract the total number of items (itemCount) and the maximum allowed time/weight (timeLimit)
    // from the first line of the processed input.
    const itemCount = parseInt(processedLines[0][0], 10);
    const timeLimit = parseInt(processedLines[0][1], 10);

    // Initialize an array to hold the data for each item.
    // Each item's data will be an array [weight, value].
    let itemDataList = [];
    // Populate the itemDataList by parsing integer values from the input lines,
    // starting from the second line (index 1 in processedLines).
    for (let idx = 0; idx < itemCount; idx++) {
        itemDataList.push(processedLines[idx + 1].map(elementStr => parseInt(elementStr, 10)));
    }

    // Sort the itemDataList based on the second element of each item (its value)
    // in ascending order. This sorting is a critical step for the algorithm.
    itemDataList.sort((firstItem, secondItem) => firstItem[1] - secondItem[1]);

    // Initialize a 2D array (dynamic programming table) to store maximum values.
    // dynamicProgTable[i][j] will represent the maximum value achievable using
    // the first 'i' items with a total capacity 'j'.
    let dynamicProgTable = [];
    // The first row (representing 0 items) is initialized with zeros for all capacities.
    dynamicProgTable.push(Array.from({ length: timeLimit + 1 }, () => 0));

    let currentItemWeight, currentItemValue;

    // Iterate through the items to fill the dynamic programming table.
    // The loop runs for `itemCount - 1` items, implying the last item is handled differently.
    for (let itemIndex = 0; itemIndex < itemCount - 1; itemIndex++) {
        dynamicProgTable.push([]); // Add a new row for the current item's calculations.
        currentItemWeight = itemDataList[itemIndex][0]; // Get the weight (A) of the current item.
        currentItemValue = itemDataList[itemIndex][1];  // Get the value (B) of the current item.

        // Iterate through all possible capacities from 0 up to timeLimit.
        for (let currentTime = 0; currentTime < timeLimit + 1; currentTime++) {
            // If the current item's weight is less than or equal to the current capacity:
            // We can either include the item or not.
            // - Not including: value is dynamicProgTable[itemIndex][currentTime] (value from previous item, same capacity).
            // - Including: value is dynamicProgTable[itemIndex][currentTime - currentItemWeight] + currentItemValue
            //   (value from previous item with reduced capacity, plus current item's value).
            // We choose the maximum of these two options.
            if (currentItemWeight <= currentTime) {
                dynamicProgTable[itemIndex + 1][currentTime] = Math.max(
                    dynamicProgTable[itemIndex][currentTime],
                    dynamicProgTable[itemIndex][currentTime - currentItemWeight] + currentItemValue
                );
            } else {
                // If the current item's weight exceeds the current capacity,
                // we cannot include it. The value remains the same as without this item.
                dynamicProgTable[itemIndex + 1][currentTime] = dynamicProgTable[itemIndex][currentTime];
            }
        }
    }

    // A specific calculation for the last item (itemCount - 1).
    // Its value is added to the DP result at `timeLimit - 1`.
    let finalConsiderationValue;
    finalConsiderationValue = dynamicProgTable[itemCount - 1][timeLimit - 1] + itemDataList[itemCount - 1][1];

    /*
    // The following block was commented out in the original code.
    // It appears to be an alternative or previous approach to handling the last item,
    // possibly for a different DP state definition or problem variant.
    // itemIndex = itemCount - 1;
    // currentItemWeight = itemDataList[itemIndex][0];
    // currentItemValue = itemDataList[itemIndex][1];
    // for (let currentTime = 0; currentTime < timeLimit; currentTime++){
    //     // console.log(itemIndex, currentTime, dynamicProgTable);
    //     finalConsiderationValue.push([0, 0]); // This suggests finalConsiderationValue was an array
    //     if (currentItemWeight <= currentTime){
    //         finalConsiderationValue[currentTime][0] = Math.max(dynamicProgTable[itemIndex][currentTime], dynamicProgTable[itemIndex][currentTime - currentItemWeight] + currentItemValue);
    //     } else {
    //         finalConsiderationValue[currentTime][0] = dynamicProgTable[itemIndex][currentTime];
    //     }
    //     finalConsiderationValue[currentTime][1] = Math.max(dynamicProgTable[itemIndex][currentTime][1], dynamicProgTable[itemIndex][currentTime][0] + currentItemValue);
    // }
    */

    // The final output is the maximum of two values:
    // 1. The maximum value from the DP table considering all items (up to itemCount - 1)
    //    and the full timeLimit.
    // 2. The `finalConsiderationValue` which incorporates the last item's value
    //    with a slightly reduced time limit.
    console.log(Math.max(dynamicProgTable[itemCount - 1][timeLimit], finalConsiderationValue));
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
