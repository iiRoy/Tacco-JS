function processInputData(rawInputString) {
    const inputNumberStrings = rawInputString.split(" ");

    const requiredNumbersSet = new Set([1, 9, 7, 4]);
    const expectedMatchCount = requiredNumbersSet.size;

    const uniqueRequiredNumbersFound = new Set();
    let totalMatchingElements = 0;

    for (let loopIndex = 0; loopIndex < inputNumberStrings.length; loopIndex++) {
        const currentNumericValue = parseInt(inputNumberStrings[loopIndex], 10);

        if (requiredNumbersSet.has(currentNumericValue)) {
            uniqueRequiredNumbersFound.add(currentNumericValue);
            totalMatchingElements++;
        }
    }

    const allRequiredFound = uniqueRequiredNumbersFound.size === expectedMatchCount;
    const correctTotalMatches = totalMatchingElements === expectedMatchCount;

    if (allRequiredFound && correctTotalMatches) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
