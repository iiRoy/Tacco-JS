function ProcessInput(rawData) {
    // The raw input string is split into an array of individual lines.
    let lineData = rawData.split("\n");

    // The first line contains space-separated numbers; parse them.
    const firstLineNumbers = lineData[0].split(' ').map(val => parseInt(val, 10));
    const countElements = firstLineNumbers[0]; // This corresponds to N in the problem description.
    // The second line also contains space-separated numbers; parse them into an array.
    const valueArray = lineData[1].split(' ').map(val => parseInt(val, 10)); // This corresponds to bList.

    // Initialize the sum with the first element of the value array.
    let sumResult = valueArray[0];

    // Loop through the array, calculating the sum of minimums of adjacent elements.
    // The loop runs up to N-2, as per the problem's logic.
    for (let idx = 0; idx < countElements - 2; idx++) {
        sumResult += Math.min(valueArray[idx], valueArray[idx + 1]);
    }

    // Add the last specific element to the total sum.
    sumResult += valueArray[countElements - 2];

    // Output the final calculated sum to the console.
    console.log(sumResult);
}

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
