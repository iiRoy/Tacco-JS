function ProcessInput(rawData) {
    // Separate the incoming string into individual components based on a space delimiter.
    const parsedValues = rawData.split(" ");

    // Parse the initial component into a floating-point number.
    const firstValue = parseFloat(parsedValues[0]);
    // Parse the subsequent component into a floating-point number.
    const secondValue = parseFloat(parsedValues[1]);

    // Establish a predefined sequence of numerical ranks.
    const rankingOrder = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];

    // Ascertain the positional index of the first parsed value within the ranking sequence.
    const firstIndex = rankingOrder.indexOf(firstValue);
    // Ascertain the positional index of the second parsed value within the ranking sequence.
    const secondIndex = rankingOrder.indexOf(secondValue);

    // Evaluate the relative positions to determine the outcome.
    if (firstIndex < secondIndex) {
        // If the first value's rank is superior, declare "Bob" as the victor.
        console.log("Bob");
        return; // Conclude execution.
    }

    if (secondIndex < firstIndex) {
        // If the second value's rank is superior, declare "Alice" as the victor.
        console.log("Alice");
        return; // Conclude execution.
    }

    // Should both values possess identical ranks, the result is a stalemate.
    if (firstIndex === secondIndex) {
        console.log("Draw");
        return; // Conclude execution.
    }
}

// Retrieve data from the standard input stream and initiate the processing routine.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
