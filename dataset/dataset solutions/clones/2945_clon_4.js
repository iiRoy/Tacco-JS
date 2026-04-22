const processInput = (rawContent) => {
    // Split the input into lines. The original code's behavior for empty lines
    // beyond the query count is to ignore them, which this setup naturally achieves.
    const contentLines = rawContent.split('\n');

    // Extract the number of queries from the first line and convert to a number.
    // Use shift() to remove it from the array, simplifying subsequent iteration over queries.
    const queryCount = Number(contentLines.shift());

    // An object to maintain the state, encapsulating related data.
    // This is a departure from the original's use of separate global-like variables.
    const dataStore = {
        sumOfValues: 0,
        valueList: []
    };

    // Iterate through the query lines using a functional forEach,
    // processing only up to the specified queryCount.
    // This replaces the original's imperative for loop.
    contentLines.slice(0, queryCount).forEach( (currentLine) => {
        // Parse the line into string components first to determine the operation type.
        const currentLineStringParts = currentLine.split(' ');
        const operationCommand = currentLineStringParts[0];

        // The original code uses an `if (tmp[0] == 1)` and then an `else` block for Type 2 queries.
        // This structure replicates that logic, capturing any non-'1' command as a Type 2 query.
        if (operationCommand === '1') {
            const operandX = Number(currentLineStringParts[1]); // Convert 'a' to a number.
            // The original code also parses tmp[2] (b) and adds it to sum_b, but sum_b is never used.
            // To focus on equivalent *observable* functionality, this unused accumulation is omitted.

            dataStore.sumOfValues += operandX;
            dataStore.valueList.push(operandX);
        } else {
            // This block handles Type 2 queries, or any line not starting with '1' (including empty lines
            // if they were within the queryCount, though the problem context implies valid query formats).

            // Replicate original behavior for an empty list: prints 'NaN 0'.
            if (dataStore.valueList.length === 0) {
                 console.log('NaN 0');
                 return; // Skip further calculations for this specific query.
            }

            // Calculate the average of the stored numbers.
            const averageVal = dataStore.sumOfValues / dataStore.valueList.length;

            // Find the element in the list closest to the average.
            // This uses a functional `reduce` method, providing a distinct approach from the original's imperative loop.
            const chosenElement = dataStore.valueList.reduce((bestCandidate, currentNumber) => {
                const currentDistance = Math.abs(currentNumber - averageVal);
                const bestDistance = Math.abs(bestCandidate - averageVal);

                if (currentDistance < bestDistance) {
                    return currentNumber;
                } else if (currentDistance === bestDistance) {
                    // Tie-breaking: if distances are equal, choose the smaller number.
                    return Math.min(bestCandidate, currentNumber);
                }
                return bestCandidate;
            }, dataStore.valueList[0]); // Initialize with the first element for comparison.

            // Calculate the sum of absolute differences between each number and the chosen element.
            // Another functional `reduce` replacing an imperative loop.
            const totalAbsoluteDifference = dataStore.valueList.reduce((accumulator, number) => {
                return accumulator + Math.abs(number - chosenElement);
            }, 0);

            // Output the results using a template literal, which is different from the original's printf-style.
            console.log(`${chosenElement} ${totalAbsoluteDifference}`);
        }
    });
};

// This section handles reading input and initiating the processing.
// It serves the same role as the original's Main call.
const performOperations = () => {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processInput(inputContent);
};

performOperations();