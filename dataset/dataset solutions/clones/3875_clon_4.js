(function() {
    const acquireSourceData = require("fs").readFileSync("/dev/stdin", "utf8");

    function parseNumericalSequence(textualInput) {
        const numericalCollection = [];
        let temporaryNumberString = '';
        for (let indexChar = 0; indexChar < textualInput.length; indexChar++) {
            const currentCharacter = textualInput[indexChar];
            if (currentCharacter >= '0' && currentCharacter <= '9') {
                temporaryNumberString += currentCharacter;
            } else {
                if (temporaryNumberString.length > 0) {
                    numericalCollection.push(parseInt(temporaryNumberString, 10));
                    temporaryNumberString = '';
                }
            }
        }
        if (temporaryNumberString.length > 0) {
            numericalCollection.push(parseInt(temporaryNumberString, 10));
        }
        return numericalCollection;
    }

    const allExtractedNumbers = parseNumericalSequence(acquireSourceData);

    const availableCredit = allExtractedNumbers[1];
    const itemPriceListUnsorted = [];
    for (let indexValue = 2; indexValue < allExtractedNumbers.length; indexValue++) {
        itemPriceListUnsorted.push(allExtractedNumbers[indexValue]);
    }

    function sortElementsAscending(inputArray) {
        const arrayLength = inputArray.length;
        for (let outerIndex = 0; outerIndex < arrayLength - 1; outerIndex++) {
            let minimumElementIndex = outerIndex;
            for (let innerIndex = outerIndex + 1; innerIndex < arrayLength; innerIndex++) {
                if (inputArray[innerIndex] < inputArray[minimumElementIndex]) {
                    minimumElementIndex = innerIndex;
                }
            }
            if (minimumElementIndex !== outerIndex) {
                const temporaryHolder = inputArray[outerIndex];
                inputArray[outerIndex] = inputArray[minimumElementIndex];
                inputArray[minimumElementIndex] = temporaryHolder;
            }
        }
        return inputArray;
    }

    const itemPriceList = sortElementsAscending(itemPriceListUnsorted);

    let expenditureSum = 0;
    for (let currentPrice of itemPriceList) {
        expenditureSum += currentPrice;
    }

    const initialItemCount = itemPriceList.length;
    const lowestItemValue = itemPriceList[0];
    const fundsRemaining = availableCredit - expenditureSum;

    let extraItemsAcquirable = Math.floor(fundsRemaining / lowestItemValue);

    const totalAcquisitions = initialItemCount + extraItemsAcquirable;

    console.log(totalAcquisitions);
})();