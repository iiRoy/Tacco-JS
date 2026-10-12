function processInput(rawData) {
    // The first line of input contains two space-separated numbers:
    // N (number of items) and X (an initial value).
    // We parse these into numerical variables.
    let numItems = rawData[0].split(" ")[0] - 0; // Convert the first part to a number
    let initialValue = rawData[0].split(" ")[1] - 0; // Convert the second part to a number

    // Initialize an array to hold subsequent numerical inputs
    // and a variable to accumulate their sum.
    const sortedNumbers = [];
    let totalSum = 0;

    // Iterate from the second line of input up to N lines.
    // Each line contains a single number.
    for (let idx = 1; idx <= numItems; idx++) {
        const currentNum = rawData[idx] - 0; // Convert the current line to a number
        totalSum += currentNum; // Add to the running total
        sortedNumbers.push(currentNum); // Add to the array
    }

    // Sort the collected numbers in ascending order.
    // This is a standard numerical sort using a comparator function.
    sortedNumbers.sort((valA, valB) => valA - valB);

    // Adjust the initial value by subtracting the sum of all collected numbers.
    initialValue -= totalSum;

    // Calculate the final result:
    // It's the number of items plus the floor division of the adjusted initial value
    // by the smallest number in the sorted list (which is the first element).
    console.log(numItems + Math.floor(initialValue / sortedNumbers[0]));
}

// This block reads the entire standard input,
// decodes it as UTF-8, removes leading/trailing whitespace,
// and splits it into an array of strings by newline characters.
// This array is then passed to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
