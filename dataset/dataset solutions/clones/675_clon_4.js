const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const prepareInput = (rawContent) => {
    return rawContent
        .trim()
        .split('\n')
        .filter(lineEntry => lineEntry !== '0 0 0 0 0 0');
};

const computeResultForLine = (dataLine) => {
    const numericalComponents = dataLine.split(' ').map(strVal => parseInt(strVal, 10));

    const [componentA, componentB, componentC, componentD, componentE, componentF] = numericalComponents;

    const primaryCategorySum = componentA + componentD;
    const secondaryCategorySum = componentB + componentE;
    const tertiaryCategorySum = componentC + componentF;

    let finalAccumulator = 0;

    // Add contributions from full groups of three
    finalAccumulator += Math.floor(primaryCategorySum / 3);
    finalAccumulator += Math.floor(secondaryCategorySum / 3);
    finalAccumulator += Math.floor(tertiaryCategorySum / 3);

    // Calculate remaining items after forming full groups
    const primaryCategoryRemainder = primaryCategorySum % 3;
    const secondaryCategoryRemainder = secondaryCategorySum % 3;
    const tertiaryCategoryRemainder = tertiaryCategorySum % 3;

    // Add contributions from forming groups of one from each remaining category
    // This directly calculates the number of times the original's final 'while' loop would execute
    finalAccumulator += Math.min(primaryCategoryRemainder, secondaryCategoryRemainder, tertiaryCategoryRemainder);

    return finalAccumulator;
};

const processedEntries = prepareInput(sourceData);

processedEntries.forEach(entry => {
    console.log(computeResultForLine(entry));
});