const processInput = (rawText) => {
    const lines = rawText.split('\n');

    const parsedEntries = lines.slice(1).flatMap(lineContent => {
        const trimmedLine = lineContent.trim();
        if (trimmedLine === '') {
            return [];
        }
        return [trimmedLine.split(' ').map(Number)];
    });

    const computeValue = (initialNum, pA, pB, pC, pD) => {
        const factorCheckRecursive = (currentNum, divisor, countHolder) => {
            if (currentNum % divisor === 0) {
                countHolder.val++;
                computeValue(currentNum / divisor, pA, pB, pC, pD);
                return factorCheckRecursive(currentNum, divisor, countHolder);
            }
            return countHolder.val;
        };

        let countForTwo = { val: 0 };
        let countForThree = { val: 0 };
        let countForFive = { val: 0 };

        factorCheckRecursive(initialNum, 2, countForTwo);
        factorCheckRecursive(initialNum, 3, countForThree);
        factorCheckRecursive(initialNum, 5, countForFive);

        if (countForTwo.val === 0 && countForThree.val === 0 && countForFive.val === 0) {
            return Math.min(
                computeValue(initialNum + 1, pA, pB, pC, pD),
                computeValue(initialNum - 1, pA, pB, pC, pD)
            );
        }
    };

    parsedEntries.forEach(entryTuple => {
        const [valueN, valueA, valueB, valueC, valueD] = entryTuple;
        const computedResult = computeValue(valueN, valueA, valueB, valueC, valueD);
        console.log(computedResult);
    });
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
