function ProcessInput(rawData) {
    // Split the entire input string by newline characters.
    rawData = rawData.split("\n");

    // Extract the first line, which contains N and K, separated by a space.
    let tempArr = rawData[0].split(" ");

    // N represents the total number of items.
    let itemCount = tempArr[0];
    // K represents the number of items to select for the sum.
    let selectCount = tempArr[1];

    // The second line contains space-separated price strings.
    let priceStrings = rawData[1].split(" ");

    // Initialize an array to hold numerical prices.
    let pricesNum = [];
    // Loop through the price strings and convert them to integers.
    for (let idx = 0; idx < itemCount; idx++) {
        pricesNum[idx] = parseInt(priceStrings[idx], 10); // Base 10 conversion
    }

    // Sort the numerical prices in ascending order.
    pricesNum.sort(
        function (valA, valB) {
            // Custom comparison function for ascending order.
            return (valA < valB ? -1 : 1);
        }
    );

    // Initialize a variable to accumulate the total cost.
    let totalCost = 0;
    // Sum the 'k' smallest prices.
    for (let idx = 0; idx < selectCount; idx++) {
        totalCost += pricesNum[idx];
    }

    // Output the calculated total cost to the console.
    console.log(totalCost);
}

// The following line is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
