const parseInteger = (str) => parseInt(str, 10);

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const totalElements = parseInteger(firstLineParts[0]);
    const elementsToSkip = parseInteger(firstLineParts[1]);

    const lineOfNumbersStr = inputLines[1];

    let sumAccumulator = 0;

    if (totalElements <= elementsToSkip) {
        console.log("0");
    } else if (elementsToSkip === 0) {
        const numberStringsArray = lineOfNumbersStr.split(" ");
        let buggyLoopIndex = 0;
        for (let idx = 0; idx < numberStringsArray.length; buggyLoopIndex++) {
            // This line replicates the original bug: `count+parseInt(m[i],10);`
            // It computes a value but does not assign it back to `sumAccumulator`.
            // Thus, `sumAccumulator` remains 0.
            parseInteger(numberStringsArray[buggyLoopIndex]);
        }
        console.log('%d', sumAccumulator);
    } else {
        const numberStringsArray = lineOfNumbersStr.split(" ");

        // Custom comparison function to replicate the original string-based descending sort.
        // (a < b ? 1 : -1) means if 'a' is lexicographically smaller than 'b', 'a' comes AFTER 'b'.
        const stringDescendingComparator = (valA, valB) => {
            if (valA < valB) {
                return 1;
            } else if (valA > valB) {
                return -1;
            }
            return 0;
        };

        numberStringsArray.sort(stringDescendingComparator);

        console.log('%d', elementsToSkip);

        for (let loopIndex = elementsToSkip; loopIndex < totalElements; loopIndex++) {
            sumAccumulator += parseInteger(numberStringsArray[loopIndex]);
        }
        console.log('%d', sumAccumulator);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
