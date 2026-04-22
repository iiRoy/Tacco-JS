const parseInteger = (textualData) => Number(textualData);
const convertStringListToNumberList = (stringList) => stringList.map(parseInteger);
const getAbsoluteValue = (numericValue) => Math.abs(numericValue);
const retrieveMinimum = (...values) => Math.min(...values);
const retrieveMaximum = (...values) => Math.max(...values);

const processInputAndCalculate = (sourceData) => {
    const dataLines = sourceData.split('\n');

    const [elementCount, limitValue] = convertStringListToNumberList(dataLines[0].split(' '));
    const individualElementValues = convertStringListToNumberList(dataLines[1].split(' '));

    const prefixSums = individualElementValues.reduce((accumulator, currentItem, indexPosition) => {
        const priorSum = indexPosition > 0 ? accumulator[indexPosition - 1] : 0;
        accumulator.push(priorSum + currentItem);
        return accumulator;
    }, []);

    const initialAccumulatedResult = (elementCount + 1) * limitValue;

    const recursiveCalculation = (
        currentPosition,
        currentSequenceLength,
        currentTotalSum
    ) => {
        if (currentPosition < 0) {
            return currentTotalSum;
        }

        let nextSequenceLength = currentSequenceLength + 1;
        let nextTotalSum = currentTotalSum;

        if (nextSequenceLength > 2 && limitValue <= prefixSums[currentPosition] * (nextSequenceLength - 1) * 2 - individualElementValues[currentPosition] * 2) {
            nextSequenceLength = 1;
            nextTotalSum += limitValue;
        }

        nextTotalSum += individualElementValues[currentPosition] * (retrieveMaximum(nextSequenceLength, 2) * 2 + 1);

        return recursiveCalculation(
            currentPosition - 1,
            nextSequenceLength,
            nextTotalSum
        );
    };

    const finalComputedResult = recursiveCalculation(
        elementCount - 1,
        0,
        initialAccumulatedResult
    );

    console.log(finalComputedResult);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));