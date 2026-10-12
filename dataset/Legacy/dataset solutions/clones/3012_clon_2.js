function ProcessInput(rawData) {
    // The input string is split into an array of lines.
    rawData = rawData.split("\n");

    // The first line contains numerical data, which is parsed.
    const firstLineNumbers = rawData[0].split(' ').map(val => parseInt(val, 10));
    const arrayLength = firstLineNumbers[0]; // This corresponds to N in the original problem.

    // The second line contains the main array of numbers.
    const dataArray = rawData[1].split(' ').map(val => parseInt(val, 10)); // This corresponds to AList.

    // An empty array is initialized to store the divisors.
    const divisorCollection = [];

    // The largest element in the dataArray is identified.
    // Assuming the array is sorted or the problem implies N-1 is the index of the max.
    const largestElement = dataArray[arrayLength - 1]; // This corresponds to MaxNumber.

    // A loop iterates from 1 up to the largest element to find its divisors.
    for (let counter = 1; counter <= largestElement; counter++) {
        // If 'counter' divides 'largestElement' evenly, it's a divisor.
        if (largestElement % counter === 0) {
            divisorCollection.push(counter);
        }
    }

    // The list of divisors is reversed to process them from largest to smallest.
    const descendingDivisors = divisorCollection.reverse();

    // The code then iterates through the descending list of divisors.
    for (let counter = 0; counter < descendingDivisors.length; counter++) {
        let currentDivisor = descendingDivisors[counter]; // This corresponds to yakusuu.

        // The dataArray is filtered to find elements that are divisible by the current divisor.
        let divisibleElements = dataArray.filter((item) => item % currentDivisor === 0);

        // A specific condition is checked: if the count of divisible elements plus one
        // is greater than or equal to the total length of the dataArray.
        if (divisibleElements.length + 1 >= dataArray.length) {
            // If the condition is met, the current divisor is printed to the console, and the function terminates.
            console.log(currentDivisor);
            return;
        }
    }

    // If the loop completes without finding a divisor that satisfies the condition, '1' is printed.
    console.log(1);
}

// The program reads its input from standard input using Node.js's file system module.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
