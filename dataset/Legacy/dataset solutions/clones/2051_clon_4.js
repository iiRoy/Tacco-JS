const processData = (rawData) => {
    "use strict";

    // Extract the relevant line from the raw input and split it into an array of string elements.
    // Using `slice(1, 2)[0]` instead of direct index `[1]` for syntactic divergence.
    const elementSequence = rawData.split('\n').slice(1, 2)[0].split(' ');

    // Compute the frequency of each unique element in the sequence using a reducer.
    const frequencyMap = elementSequence.reduce((accumulator, item) => {
        accumulator[item] = (accumulator[item] || 0) + 1;
        return accumulator;
    }, {});

    // Define a helper function to calculate combinations of 2 items (n C 2).
    // This represents the number of pairs of identical values for a given count.
    const calculateCombinationsOfTwo = (count) => count * (count - 1) / 2;

    // Determine the total number of identical pairs across all unique elements
    // in the original sequence. This is done by summing the combinations for each frequency.
    const totalInitialIdenticalPairs = Object.values(frequencyMap).reduce((sum, count) => {
        return sum + calculateCombinationsOfTwo(count);
    }, 0);

    // For each element in the original sequence, calculate and print the adjusted total.
    // The adjustment accounts for the conceptual removal of the current element's instance.
    // The change in total pairs when one instance of an element 'X' is removed is (1 - count(X)).
    elementSequence.forEach(currentValue => {
        const currentElementFrequency = frequencyMap[currentValue];
        const resultForCurrentElement = totalInitialIdenticalPairs + (1 - currentElementFrequency);
        console.log(resultForCurrentElement);
    });
};

// Read input from stdin, trim any leading/trailing whitespace, and pass it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
