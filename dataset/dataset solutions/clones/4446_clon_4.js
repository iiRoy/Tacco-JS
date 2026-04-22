const acquireSourceData = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

const parseNumericSequence = (fullContent) => {
    const linePattern = /(?:.*\n)(.*)/;
    const secondLineMatch = fullContent.match(linePattern);
    
    let processedValues = [];
    if (secondLineMatch && secondLineMatch[1]) {
        const digitClusters = secondLineMatch[1].match(/\d+/g);
        if (digitClusters) {
            processedValues = digitClusters.reduce((collectorArray, textFragment) => {
                collectorArray.push(Number(textFragment));
                return collectorArray;
            }, []);
        }
    }
    return processedValues;
};

const tallyDivisibility = (numericalCollection) => {
    return numericalCollection.reduce((accumulatedCounts, currentElement) => {
        if (currentElement % 4 === 0) {
            accumulatedCounts.divisibleByFour = (accumulatedCounts.divisibleByFour || 0) + 1;
        } else if (currentElement % 2 === 0) {
            accumulatedCounts.divisibleByTwoNotFour = (accumulatedCounts.divisibleByTwoNotFour || 0) + 1;
        }
        return accumulatedCounts;
    }, { divisibleByFour: 0, divisibleByTwoNotFour: 0 });
};

const performEvaluation = () => {
    const initialInput = acquireSourceData();
    const parsedNumericalArray = parseNumericSequence(initialInput);
    const categorizedCounts = tallyDivisibility(parsedNumericalArray);

    let countOfFourMultiples = categorizedCounts.divisibleByFour;
    let countOfTwoNotFourMultiples = categorizedCounts.divisibleByTwoNotFour;

    let adjustedTwoNotFourCount = countOfTwoNotFourMultiples - 2;
    adjustedTwoNotFourCount = (adjustedTwoNotFourCount < 0) ? 0 : adjustedTwoNotFourCount;

    const totalQuantity = parsedNumericalArray.length;

    const finalCriterionMet = (countOfFourMultiples * 3 + adjustedTwoNotFourCount >= totalQuantity);

    process.stdout.write(finalCriterionMet ? "Yes" : "No");
};

performEvaluation();