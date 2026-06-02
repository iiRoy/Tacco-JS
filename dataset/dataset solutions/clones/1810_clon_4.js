const processInputData = (rawInput) => {
    const [firstLineContent, secondLineContent] = rawInput.split('\n');
    const numericCount = Number(firstLineContent);
    const stringifiedNumbers = secondLineContent.split(' ');
    return { numericCount, stringifiedNumbers };
};

const performCalculation = (processedData) => {
    const { numericCount, stringifiedNumbers } = processedData;

    const initialAccumulator = 1n;
    const productResult = stringifiedNumbers.slice(0, numericCount).reduce((currentProduct, currentElement) => {
        return currentProduct * BigInt(currentElement);
    }, initialAccumulator);

    const comparisonThreshold = 10n ** 8n;
    const finalOutputValue = productResult > comparisonThreshold ? -1n : productResult;

    return finalOutputValue;
};

const orchestrateExecution = (inputSource) => {
    const parsedData = processInputData(inputSource);
    const computedValue = performCalculation(parsedData);
    console.log(`${computedValue}`);
};

orchestrateExecution(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
