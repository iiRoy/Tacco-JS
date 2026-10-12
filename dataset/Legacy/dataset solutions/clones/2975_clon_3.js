function processInputData(rawDataString) {
    const trimmedInput = rawDataString.trim();
    const stringComponents = trimmedInput.split(" ");
    const numericValues = stringComponents.map(strValue => parseInt(strValue, 10));

    const redColorValue = numericValues[0];
    const greenColorValue = numericValues[1];
    const blueColorValue = numericValues[2];
    const targetSumValue = numericValues[3];

    const colorDenominations = [redColorValue, greenColorValue, blueColorValue].sort((a, b) => b - a);

    const largestDenomination = colorDenominations[0];
    const secondLargestDenomination = colorDenominations[1];
    const smallestDenomination = colorDenominations[2];
    
    let totalValidCombinations = 0;

    const maxCountForLargest = Math.floor(targetSumValue / largestDenomination);

    for (let countLargest = 0; countLargest <= maxCountForLargest; countLargest++) {
        const remainingAfterLargest = targetSumValue - (countLargest * largestDenomination);

        if (remainingAfterLargest < 0) {
            break; 
        }

        const maxCountForSecondLargest = Math.floor(remainingAfterLargest / secondLargestDenomination);

        for (let countSecondLargest = 0; countSecondLargest <= maxCountForSecondLargest; countSecondLargest++) {
            const remainingAfterTwo = remainingAfterLargest - (countSecondLargest * secondLargestDenomination);

            if (remainingAfterTwo < 0) {
                break;
            }
            
            if (remainingAfterTwo % smallestDenomination === 0) {
                totalValidCombinations++;
            }
        }
    }
    console.log(totalValidCombinations);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
