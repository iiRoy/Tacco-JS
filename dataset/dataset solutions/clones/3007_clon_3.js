const processInput = (rawData) => {
    const RADIX_DECIMAL = 10;

    const parseNumericArray = (strArray, expectedSize, radix) => {
        const numericResult = new Array(expectedSize);
        for (let k = 0; k < expectedSize; k++) {
            numericResult[k] = parseInt(strArray[k], radix);
        }
        return numericResult;
    };

    const determineNetBenefit = (itemValue, itemCost) => itemValue - itemCost;

    const allInputLines = rawData.split("\n");

    const itemCountString = allInputLines[0];
    const valueLineString = allInputLines[1];
    const costLineString = allInputLines[2];

    const itemCount = parseInt(itemCountString, RADIX_DECIMAL);

    const valueComponents = valueLineString.split(" ");
    const costComponents = costLineString.split(" ");

    const itemValues = parseNumericArray(valueComponents, itemCount, RADIX_DECIMAL);
    const itemCosts = parseNumericArray(costComponents, itemCount, RADIX_DECIMAL);

    let totalAccumulatedBenefit = 0;

    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
        const individualValue = itemValues[currentIdx];
        const individualCost = itemCosts[currentIdx];
        const calculatedNetBenefit = determineNetBenefit(individualValue, individualCost);

        if (calculatedNetBenefit > 0) {
            totalAccumulatedBenefit += calculatedNetBenefit;
        }
    }

    console.log(totalAccumulatedBenefit);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
