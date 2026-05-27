function processInputData(rawInputString) {
    const inputTokens = rawInputString.split(" ");

    const requiredNumericStrings = ["1", "7", "4", "9"];
    const requiredValuesSet = new Set(requiredNumericStrings);

    const discoveredValuesSet = new Set();

    const numberOfChecks = 4;
    for (let currentElementIndex = 0; currentElementIndex < numberOfChecks; currentElementIndex++) {
        const currentToken = inputTokens[currentElementIndex];

        if (requiredValuesSet.has(currentToken)) {
            discoveredValuesSet.add(currentToken);
        }
    }

    const areAllRequiredFound = (targetSet, foundSet) => {
        return foundSet.size === targetSet.size;
    };

    if (areAllRequiredFound(requiredValuesSet, discoveredValuesSet)) {
        console.log('YES');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
