function processInput(rawData) {
    const MODULO_CONSTANT = 1000000007; // Represents 1e9 + 7

    const inputLines = rawData.split("\n");
    const firstLineData = inputLines[0].split(" ");
    const numElements = parseInt(firstLineData[0], 10);
    const repeatCount = parseInt(firstLineData[1], 10);

    const dataString = inputLines[1];
    const singlePassArray = dataString.split(" ").map(Number);
    const doublePassArray = (dataString + " " + dataString).split(" ").map(Number);

    // Helper function to determine if an array contains varying elements
    const containsVariation = (arr) => {
        for (let elementIndex = 0; elementIndex < arr.length - 1; elementIndex++) {
            if (arr[elementIndex] !== arr[elementIndex + 1]) {
                return true;
            }
        }
        return false;
    };

    // Helper function to compute the total number of inversions in an array
    const computeInversions = (arr) => {
        let totalInversions = 0;
        for (let outerIndex = 0; outerIndex < arr.length; outerIndex++) {
            for (let innerIndex = outerIndex + 1; innerIndex < arr.length; innerIndex++) {
                const firstValue = arr[outerIndex];
                const secondValue = arr[innerIndex];
                if (firstValue > secondValue) {
                    totalInversions++;
                }
            }
        }
        return totalInversions;
    };

    // Early exit if the array has no variation (all elements are the same)
    if (!containsVariation(singlePassArray)) {
        console.log("0");
        return;
    }

    // Calculate inversions for the single-pass array
    const inversionsSingle = computeInversions(singlePassArray);

    // Calculate inversions for the double-pass array
    const inversionsDouble = computeInversions(doublePassArray);

    // Handle cases where repeatCount is 1 or 2 directly
    if (repeatCount <= 2) {
        const finalResult = (repeatCount === 1) ? inversionsSingle : inversionsDouble;
        console.log(finalResult);
    } else {
        // For repeatCount > 2, calculate iteratively using the recurrence relation
        let previousTerm1 = inversionsSingle; // Corresponds to resultList[0]
        let previousTerm2 = inversionsDouble; // Corresponds to resultList[1]

        let currentIteration = 2;
        while (currentIteration < repeatCount) {
            const nextCalculatedTerm = previousTerm1 + previousTerm2 + previousTerm2;
            previousTerm1 = previousTerm2;
            previousTerm2 = nextCalculatedTerm;
            currentIteration++;
        }
        console.log(previousTerm2 % MODULO_CONSTANT);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
