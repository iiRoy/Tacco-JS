// inputに入力データ全体が入る
function processInputData(rawData) {
    const lines = rawData.split("\n");

    const configLine = lines[0];
    const configParts = configLine.split(" ");
    const numCakes = parseInt(configParts[0], 10); // N, total number of cake entries
    const cakesToSelect = parseInt(configParts[1], 10); // K, number of cakes to select

    // Early exit if no cakes are to be selected, preserving original behavior
    if (cakesToSelect === 0) {
        console.log(0);
        return;
    }

    // Extract the raw cake data lines from the input
    const rawCakeEntries = lines.slice(1, numCakes + 1);

    // Helper function to safely parse a string into an integer
    const parseNumericValue = (str) => parseInt(str, 10);

    // Parse all cake values into a 2D array of numbers
    // Each inner array represents the components (e.g., calories) of a single cake
    const parsedCakeValues = rawCakeEntries.map(entryLine => {
        return entryLine.split(" ").map(parseNumericValue);
    });

    // Helper function to sum all elements in a numeric array
    const sumArrayElements = (arr) => arr.reduce((accumulator, currentNum) => accumulator + currentNum, 0);

    // Calculate the total calorie count (or sum of components) for each individual cake
    const individualCakeTotals = parsedCakeValues.map(cakeComponents => sumArrayElements(cakeComponents));

    // Sort the individual cake totals in ascending order, matching original logic (l < r for ascending)
    const sortedTotalsAscending = individualCakeTotals.sort((leftVal, rightVal) => leftVal - rightVal);

    // Select the top K cakes (which are the smallest K sums due to ascending sort)
    const topKCakes = sortedTotalsAscending.slice(0, cakesToSelect);

    // Sum the calories of these selected K cakes to get the final answer
    const finalTotalCalories = sumArrayElements(topKCakes);

    console.log(finalTotalCalories);
}

// この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
