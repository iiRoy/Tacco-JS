const parseNumericValue = (strValue) => parseInt(strValue, 10);

function processInputData(rawDataContent) {
    const dataLines = rawDataContent.split("\n");

    const firstLineTokens = dataLines[0].split(" ");
    const totalElementsCount = parseNumericValue(firstLineTokens[0]);
    const slidingWindowSize = parseNumericValue(firstLineTokens[1]);

    const scoreValueStrings = dataLines[1].split(" ");

    const calculatedWindowProducts = [];

    for (let currentWindowEndIndex = 0; currentWindowEndIndex <= totalElementsCount; currentWindowEndIndex++) {
        if (currentWindowEndIndex >= slidingWindowSize) {
            let windowProductAccumulator = 1;
            const windowStartIndex = currentWindowEndIndex - slidingWindowSize;

            for (let elementIndex = windowStartIndex; elementIndex < currentWindowEndIndex; elementIndex++) {
                const currentScore = parseNumericValue(scoreValueStrings[elementIndex]);
                windowProductAccumulator *= currentScore;
            }
            calculatedWindowProducts.push(windowProductAccumulator);
        }
    }

    const comparisonOutcomeList = [];
    let previousWindowProduct = null;

    for (let resultIndex = 0; resultIndex < calculatedWindowProducts.length; resultIndex++) {
        const currentWindowProduct = calculatedWindowProducts[resultIndex];

        if (previousWindowProduct !== null) {
            if (previousWindowProduct < currentWindowProduct) {
                comparisonOutcomeList.push('Yes');
            } else {
                comparisonOutcomeList.push('No');
            }
        }
        previousWindowProduct = currentWindowProduct;
    }

    comparisonOutcomeList.forEach(outcome => {
        console.log(outcome);
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
