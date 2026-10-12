function ProcessInput(inputString) {
    // Split the entire input string into individual lines.
    let lines = inputString.split("\n");

    // The first line provides the total number of elements for the arrays.
    const countElements = lines[0];

    // Parse the second line to create the first array of integers.
    const arrayA = lines[1].split(" ").map(elementString => parseInt(elementString, 10));

    // Parse the third line to create the second array of integers.
    const arrayB = lines[2].split(" ").map(elementString => parseInt(elementString, 10));

    // Calculate the sum of all numbers in arrayA.
    const sumA = arrayA.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculate the sum of all numbers in arrayB.
    const sumB = arrayB.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Initialize a variable to accumulate a specific calculated value.
    let cumulativeCalculation = 0;

    // Iterate through the arrays to perform a per-element calculation.
    for (let index = 0; index < countElements; index++) {
        // For each pair of elements, calculate the difference, ensure it's non-negative,
        // divide by two, and round up to the nearest whole number, then add to the total.
        cumulativeCalculation += Math.ceil(Math.max(arrayB[index] - arrayA[index], 0) / 2);
    }

    // Determine the final outcome based on a comparison of the calculated value
    // against the difference between the sums of the two arrays.
    const finalDecision = cumulativeCalculation <= (sumB - sumA) ? "Yes" : "No";

    // Output the determined decision to the console.
    console.log(finalDecision);
}

// Read the entire content from standard input, remove leading/trailing whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
