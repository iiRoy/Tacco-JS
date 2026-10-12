function processInput(sourceText) {
    const lineSegments = sourceText.split("\n");

    const thresholds = lineSegments[1].split(" ");
    const limitOne = parseInt(thresholds[0], 10);
    const limitTwo = parseInt(thresholds[1], 10);

    const rawNumbers = lineSegments[2].split(" ");
    const parsedValues = rawNumbers.map(s => parseInt(s, 10));

    const categoryIdentifiers = parsedValues.map(currentValue => {
        if (currentValue <= limitOne) {
            return 'firstGroup';
        } else if (currentValue <= limitTwo) {
            return 'secondGroup';
        } else {
            return 'thirdGroup';
        }
    });

    const categoryTallies = categoryIdentifiers.reduce((accumulator, identifier) => {
        accumulator[identifier] = (accumulator[identifier] || 0) + 1;
        return accumulator;
    }, { firstGroup: 0, secondGroup: 0, thirdGroup: 0 });

    const minimumCount = Math.min(
        categoryTallies.firstGroup,
        categoryTallies.secondGroup,
        categoryTallies.thirdGroup
    );

    console.log('%s', minimumCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
