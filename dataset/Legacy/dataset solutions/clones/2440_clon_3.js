function entryPoint(inputString) {
    const parsedData = parseInputData(inputString);
    const { itemCount, timeLimit, itemDetails } = parsedData;

    const finalMaxProfit = calculateMaxProfit(itemCount, timeLimit, itemDetails);
    console.log(finalMaxProfit);
}

function parseInputData(rawData) {
    const lines = rawData.trim().split("\n");
    const [rawN, rawT] = lines[0].split(" ");
    const itemCount = Number(rawN);
    const timeLimit = Number(rawT);

    const itemDetails = [];
    for (let i = 0; i < itemCount; i++) {
        const itemLine = lines[i + 1].split(" ");
        itemDetails.push([Number(itemLine[0]), Number(itemLine[1])]);
    }
    
    itemDetails.sort((itemA, itemB) => itemA[1] - itemB[1]);

    return { itemCount, timeLimit, itemDetails };
}

function calculateMaxProfit(totalItemsCount, maxCapacity, allItemData) {
    // dpTable[k][c] stores the maximum value considering the first k items (indices 0 to k-1)
    // with a capacity of c.
    // The original code uses dp[i+1] to represent the state after considering arr_AB[i].
    // So, dpTable[k] in this clone corresponds to dp[k] in the original.
    // dpTable[0] is the base case (0 items considered).
    const dpTable = [];
    dpTable.push(Array(maxCapacity + 1).fill(0)); // Initialize dpTable[0] for zero items

    // Iterate through the first (totalItemsCount - 1) items (indices 0 to totalItemsCount - 2)
    // This loop corresponds to the original `for (var i = 0; i < N - 1; i++)`
    for (let currentItemIndex = 0; currentItemIndex < totalItemsCount - 1; currentItemIndex++) {
        dpTable.push(Array(maxCapacity + 1).fill(0)); // Create a new row for dpTable[currentItemIndex + 1]

        const currentItemCost = allItemData[currentItemIndex][0];
        const currentItemValue = allItemData[currentItemIndex][1];

        for (let currentCapacity = 0; currentCapacity <= maxCapacity; currentCapacity++) {
            const valueIfItemSkipped = dpTable[currentItemIndex][currentCapacity];
            let valueIfItemTaken = 0;

            if (currentItemCost <= currentCapacity) {
                // If the current item can be afforded, calculate the value if taken
                valueIfItemTaken = dpTable[currentItemIndex][currentCapacity - currentItemCost] + currentItemValue;
            }
            
            // Store the maximum value for the current state
            dpTable[currentItemIndex + 1][currentCapacity] = Math.max(valueIfItemSkipped, valueIfItemTaken);
        }
    }

    // After the loop, dpTable[totalItemsCount - 1] contains the max values
    // considering items from index 0 to totalItemsCount - 2.

    // Now, handle the last item (allItemData[totalItemsCount - 1]) with its specific rule.
    // This corresponds to the original `lastOrder = dp[N - 1][T - 1] + arr_AB[N - 1][1];`
    const lastItemActualValue = allItemData[totalItemsCount - 1][1];
    const specialLastItemConsideration = dpTable[totalItemsCount - 1][maxCapacity - 1] + lastItemActualValue;

    // Compare with the maximum value obtained using the first N-1 items with full capacity T.
    // This corresponds to the original `dp[N - 1][T]`
    const maxValWithoutSpecialLastItem = dpTable[totalItemsCount - 1][maxCapacity];

    return Math.max(maxValWithoutSpecialLastItem, specialLastItemConsideration);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
