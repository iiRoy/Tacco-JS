function processInput(rawData) {
    function parseInputData(rawInputString) {
        const inputLines = rawInputString.split("\n");
        const arrayLength = parseInt(inputLines[0], 10);
        const numberStrings = inputLines[1].split(" ");
        const parsedNumbers = numberStrings.map(Number);
        return { arrayLength, parsedNumbers };
    }

    function calculateMinPartitionDifference(numbers, length) {
        // Handle the base case for two elements directly
        if (length === 2) {
            const diff = numbers[0] - numbers[1];
            return Math.abs(diff);
        }

        const totalSumOfNumbers = numbers.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
        const targetHalfSum = totalSumOfNumbers / 2;

        let currentRunningPartitionSum = numbers[0];
        let sumBeforeSplitPoint = 0;
        let remainingSumBeforeSplitPoint = 0;

        // Iterate through all possible split points to find the one closest to half the total sum.
        // A split point is considered after 'k' elements.
        // The loop runs up to 'length - 1' to ensure 'numbers[k + 1]' is a valid index.
        for (let k = 0; k < length - 1; k++) {
            if (currentRunningPartitionSum < targetHalfSum) {
                // Store the sums before adding the next element
                sumBeforeSplitPoint = currentRunningPartitionSum;
                remainingSumBeforeSplitPoint = totalSumOfNumbers - currentRunningPartitionSum;
                // Add the next element to the current partition sum
                currentRunningPartitionSum += numbers[k + 1];
            } else {
                // The current partition sum has just crossed or reached the target half sum.
                // This is one of the two candidate split points.
                break;
            }
        }

        // Calculate the sums for the partition after crossing the half-sum threshold
        const sumAfterSplitPoint = currentRunningPartitionSum;
        const remainingSumAfterSplitPoint = totalSumOfNumbers - currentRunningPartitionSum;

        // Special handling for exactly three elements
        if (length === 3) {
            return Math.abs(sumAfterSplitPoint - remainingSumAfterSplitPoint);
        } else {
            // For more than three elements, compare the two closest split points
            const differenceAfterCrossing = Math.abs(sumAfterSplitPoint - remainingSumAfterSplitPoint);
            const differenceBeforeCrossing = Math.abs(sumBeforeSplitPoint - remainingSumBeforeSplitPoint);
            return Math.min(differenceAfterCrossing, differenceBeforeCrossing);
        }
    }

    const { arrayLength, parsedNumbers } = parseInputData(rawData);
    const finalResult = calculateMinPartitionDifference(parsedNumbers, arrayLength);
    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
