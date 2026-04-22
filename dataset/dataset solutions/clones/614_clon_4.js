const acquireRawInput = () => require('node:fs').readFileSync(0, 'utf8');

const decomposeInputIntoSegments = (fullContent) => {
    const trimmedContent = fullContent.trim();
    return trimmedContent.split('\n');
};

const parseConfigurationAndElements = (segmentCollection) => {
    const structuralCount = Number(segmentCollection[0]);
    const dataElements = segmentCollection.slice(1);
    return { structuralCount, dataElements };
};

const synthesizeCompositeNumbers = (sourceElements) => {
    return sourceElements.flatMap((leadingPart, primaryIndex) => {
        return sourceElements.slice(primaryIndex + 1).flatMap((trailingPart) => {
            const firstCombination = Number(leadingPart + trailingPart);
            const secondCombination = Number(trailingPart + leadingPart);
            return [firstCombination, secondCombination];
        });
    });
};

const orchestrateProcessing = () => {
    const streamPayload = acquireRawInput();
    const contentSegments = decomposeInputIntoSegments(streamPayload);
    const { dataElements: numericComponents } = parseConfigurationAndElements(contentSegments);

    const generatedNumericSet = synthesizeCompositeNumbers(numericComponents);

    generatedNumericSet.sort((valueA, valueB) => valueA - valueB);

    const desiredOutcome = generatedNumericSet[2];

    console.log(desiredOutcome);
};

orchestrateProcessing();