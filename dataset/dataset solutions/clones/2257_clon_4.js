const processInputData = (rawData) => {
    const moduloConstant = 1000000007;

    const transformInputToNumbers = (inputString) => {
        return inputString.split('\n').map(line => line.split(' ').map(Number));
    };

    const parsedNumericData = transformInputToNumbers(rawData);

    const totalElements = parsedNumericData[0][0];
    const subsetSize = parsedNumericData[0][1];

    const sortedNumbers = parsedNumericData[1].sort((first, second) => second - first);

    const calculateCombinations = (totalItems, selectedItems) => {
        console.log(totalItems + "," + selectedItems);

        // If selectedItems is negative or greater than totalItems,
        // the products will naturally result in 0 or 1 as per original loop behavior.
        // For selectedItems = 0, Array.from({length:0}) results in reduce returning initial value (1).
        // For selectedItems < 0, Array.from({length:negative}) results in empty array, reduce returns 1.
        // For selectedItems > totalItems, numeratorProduct will eventually multiply by 0 or negative, resulting in 0.

        const numeratorProduct = Array.from({ length: Math.max(0, selectedItems) }, (_, idx) => totalItems - idx)
                                      .reduce((accumulator, currentValue) => accumulator * currentValue, 1);

        const denominatorProduct = Array.from({ length: Math.max(0, selectedItems) }, (_, idx) => idx + 1)
                                        .reduce((accumulator, currentValue) => accumulator * currentValue, 1);

        console.log(numeratorProduct + "/" + denominatorProduct + "=" + (numeratorProduct / denominatorProduct));
        return numeratorProduct / denominatorProduct;
    };

    const resultContainer = { maximumSum: 0, minimumSum: 0 };

    // Calculate maximumSum using functional approach
    resultContainer.maximumSum = Array.from({ length: sortedNumbers.length - subsetSize + 1 }, (_, currentIdx) => currentIdx)
        .reduce((accumulator, currentIdx) => {
            return accumulator + sortedNumbers[currentIdx] * calculateCombinations(totalElements - currentIdx - 1, subsetSize - 1);
        }, 0);

    // Calculate minimumSum using functional approach
    resultContainer.minimumSum = Array.from({ length: sortedNumbers.length - subsetSize + 1 }, (_, relativeIdx) => relativeIdx + (subsetSize - 1))
        .reduce((accumulator, currentIdx) => {
            return accumulator + sortedNumbers[currentIdx] * calculateCombinations(currentIdx, subsetSize - 1);
        }, 0);

    console.log((resultContainer.maximumSum - resultContainer.minimumSum) % moduloConstant);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
