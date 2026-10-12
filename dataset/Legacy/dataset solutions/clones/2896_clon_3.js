function processInputData(rawData) {
    const inputLines = rawData.trim().split(/\r\n|\n/);

    const countLimit = parseInt(inputLines[0], 10);

    const parseSidePairs = (linesToParse) => {
        return linesToParse.map(line => {
            const parsedPair = line.split(" ").map(strVal => parseInt(strVal, 10));
            return parsedPair.sort((a, b) => a - b);
        });
    };

    const parseAndFilterInitialValues = (valueLine, limit) => {
        const allValues = valueLine.split(" ").map(strVal => parseInt(strVal, 10));
        allValues.sort((a, b) => b - a); // Sort descending
        return allValues.slice(0, limit); // Take only the top 'limit' values
    };

    const sidePairs = parseSidePairs(inputLines.slice(1, inputLines.length - 1));
    const initialValues = parseAndFilterInitialValues(inputLines[inputLines.length - 1], countLimit);

    const groupedSidesByFirstElement = new Map();
    for (const pair of sidePairs) {
        const firstElementKey = pair[0];
        if (!groupedSidesByFirstElement.has(firstElementKey)) {
            groupedSidesByFirstElement.set(firstElementKey, []);
        }
        groupedSidesByFirstElement.get(firstElementKey).push(pair);
    }

    const sortedGroupedSideArrays = Array.from(groupedSidesByFirstElement.values());
    // Sort groups by their length in descending order
    sortedGroupedSideArrays.sort((arrA, arrB) => arrB.length - arrA.length);

    const flattenedSortedSides = sortedGroupedSideArrays.flat();

    let totalMinSum = 0;
    const assignedValueCache = new Map();
    const availableValuesPool = [...initialValues]; // Create a mutable copy of the initial values

    const getOrAssignValueForComponent = (componentKey) => {
        if (!assignedValueCache.has(componentKey)) {
            // This guard ensures we don't try to shift from an empty array,
            // though problem constraints usually guarantee enough values.
            if (availableValuesPool.length === 0) {
                // In a real-world scenario, this might throw an error or handle a default.
                // For strict behavioral equivalence, we assume sufficient values.
                throw new Error("Insufficient values in the pool for assignment.");
            }
            const nextValue = availableValuesPool.shift();
            assignedValueCache.set(componentKey, nextValue);
        }
        return assignedValueCache.get(componentKey);
    };

    for (const currentSidePair of flattenedSortedSides) {
        const firstComponent = currentSidePair[0];
        const secondComponent = currentSidePair[1];

        const valForFirstComponent = getOrAssignValueForComponent(firstComponent);
        const valForSecondComponent = getOrAssignValueForComponent(secondComponent);

        const currentMinVal = Math.min(valForFirstComponent, valForSecondComponent);
        totalMinSum += currentMinVal;
    }

    console.log(totalMinSum + '\n' + initialValues.join(" "));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
