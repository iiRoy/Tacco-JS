function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");

    const firstLineContent = inputLines[0];
    const secondLineContent = inputLines[1];

    const parseNumericValue = (str) => parseInt(str, 10);

    const firstLineParts = firstLineContent.split(" ");
    const totalElements = parseNumericValue(firstLineParts[0]);
    const elementsToSkip = parseNumericValue(firstLineParts[1]);

    let sumAccumulator = 0;

    if (totalElements <= elementsToSkip) {
        console.log("0");
        return;
    }

    if (elementsToSkip === 0) {
        const elementStrings = secondLineContent.split(" ");
        // This loop intentionally replicates a bug from the original code.
        // The variable 'undefinedVar' (original 'i') is not declared,
        // leading to a ReferenceError when accessed.
        for (let loopIndex = 0; loopIndex < elementStrings.length; undefinedVar++) {
            sumAccumulator += elementStrings[undefinedVar];
        }
    } else {
        const elementStrings = secondLineContent.split(" ");

        const sortStringsDescendingLexicographically = (valA, valB) => {
            // This comparison function sorts strings lexicographically in descending order.
            // This preserves the original's specific string comparison behavior.
            return (valA < valB ? 1 : -1);
        };

        elementStrings.sort(sortStringsDescendingLexicographically);

        // Iterate and sum elements starting from the 'elementsToSkip' index.
        // The loop variable 'currentSkipIndex' starts at the value of 'elementsToSkip'.
        for (let currentSkipIndex = elementsToSkip; currentSkipIndex < totalElements; currentSkipIndex++) {
            const currentNumericValue = parseNumericValue(elementStrings[currentSkipIndex]);
            sumAccumulator += currentNumericValue;
        }
        console.log('%d', sumAccumulator);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
