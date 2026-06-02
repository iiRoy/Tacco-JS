function analyzeHeightData(inputString) {
    const dataLines = inputString.split("\n");

    // Helper function to extract and parse a single numeric value from the input lines
    const extractAndParseNumber = (sourceLines) => {
        const lineContent = sourceLines.shift();
        return Number(lineContent);
    };

    const totalElements = extractAndParseNumber(dataLines);
    // Parse the second line into an array of numbers
    const elementHeights = dataLines.shift().split(' ').map(Number);

    let validPairCount = 0;

    // Helper function to determine if a pair of indices satisfies the problem's condition
    const checkPairCondition = (firstIdx, secondIdx, heightsArray) => {
        // Indices must be distinct for a valid pair
        if (firstIdx === secondIdx) {
            return false;
        }

        // Calculate the absolute difference between the 1-based indices
        const absoluteIndexDifference = Math.abs(firstIdx - secondIdx);
        // Calculate the sum of heights for the elements at the 0-based indices
        const combinedHeightSum = heightsArray[firstIdx - 1] + heightsArray[secondIdx - 1];

        // The condition is met if the absolute index difference equals the combined height sum
        return absoluteIndexDifference === combinedHeightSum;
    };

    // Iterate through all possible ordered pairs of 1-based indices
    for (let firstIndex = totalElements; firstIndex >= 1; firstIndex--) {
        for (let secondIndex = totalElements; secondIndex >= 1; secondIndex--) {
            // If the condition is met for the current pair, increment the counter
            if (checkPairCondition(firstIndex, secondIndex, elementHeights)) {
                validPairCount++;
            }
        }
    }

    // Each valid pair (i,j) will be counted twice (once as (i,j) and once as (j,i))
    // The problem requires the count of unique pairs, so divide the total by two.
    console.log(validPairCount / 2);
}

// Read input from stdin and pass it to the main processing function
analyzeHeightData(require("fs").readFileSync("/dev/stdin", "utf8"));
