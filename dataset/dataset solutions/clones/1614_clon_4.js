const acquireSourceText = (resourcePath, textEncoding) => require('fs').readFileSync(resourcePath, textEncoding);

const extractNumericalValues = (documentContent) => {
    const contentLines = documentContent.split('\n');
    contentLines.shift();
    return contentLines.map(parseFloat);
};

const formUniquePairs = (inputNumbers) => {
    return inputNumbers.flatMap((firstElement, currentIndex, sourceList) =>
        sourceList.slice(currentIndex + 1).map(secondElement => [firstElement, secondElement])
    );
};

const verifyIntegerProduct = (valuePair) => {
    const numericalProduct = valuePair[0] * valuePair[1];
    return Math.trunc(numericalProduct) === numericalProduct;
};

const presentResult = (finalValue) => {
    process.stdout.write(finalValue.toString() + '\n');
};

const executeAnalysis = (rawInputData) => {
    const processedNumbers = extractNumericalValues(rawInputData);
    const allCombinations = formUniquePairs(processedNumbers);
    const qualifyingCombinations = allCombinations.filter(verifyIntegerProduct);
    const totalMatches = qualifyingCombinations.length;
    presentResult(totalMatches);
};

executeAnalysis(acquireSourceText('/dev/stdin', 'utf8'));