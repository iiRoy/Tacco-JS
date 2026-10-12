function processData(sourceText) {
    const lines = sourceText.split('\n');
    const primaryValue = Number(lines[0]);
    const numberList = lines[1].split(' ').map(Number);

    const distinctItems = new Set(numberList);
    const distinctCount = distinctItems.size;

    const resultCollection = [primaryValue];

    function generateSubsequent(currentDivisor, limit, currentCollection) {
        if (currentDivisor > limit) {
            return currentCollection;
        }

        const calculatedValue = currentDivisor > distinctCount
            ? 0
            : Math.floor(distinctCount / currentDivisor);

        currentCollection.push(calculatedValue);
        return generateSubsequent(currentDivisor + 1, limit, currentCollection);
    }

    generateSubsequent(2, primaryValue, resultCollection);

    console.log(resultCollection.join('\n'));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
