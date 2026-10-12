const ProcessInput = rawData => {
    // Divide the incoming string into an array of substrings using space as a delimiter.
    const parsedData = rawData.split(" ");

    // Convert the first substring to an integer, representing the initial quantity of item 'A'.
    const valA = parseInt(parsedData[0], 10); // Example value: 1
    // Convert the second substring to an integer, representing the initial quantity of item 'B'.
    const valB = parseInt(parsedData[1], 10); // Example value: 0
    // Convert the third substring to an integer, representing the initial quantity of item 'C' (this value is not used in the subsequent logic).
    const valC = parseInt(parsedData[2], 10); // Example value: -1
    // Convert the fourth substring to an integer, representing the target threshold or required quantity.
    const thresholdK = parseInt(parsedData[3], 10);

    // Evaluate if the combined quantity of 'A' and 'B' items is sufficient to meet the target threshold.
    if (valA + valB >= thresholdK) {
        // If the combined quantity is sufficient, output the quantity of 'A' items.
        console.log(valA);
    } else {
        // If the combined quantity is not sufficient, calculate the adjusted quantity of 'A' items.
        // This calculation determines how many 'A' items are "left" after 'B' items are used and the threshold is considered.
        console.log(valA - (thresholdK - valA - valB));
    }
};

// Read the entire content of the standard input file as a UTF-8 string, then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
