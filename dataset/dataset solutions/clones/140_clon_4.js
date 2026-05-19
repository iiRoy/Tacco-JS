require("fs").readFileSync("/dev/stdin",'utf8').trim().split(/\s/).map(function(currentLineSegment){
    const numericValues = currentLineSegment.split(',').map(Number);

    const eleventhElement = numericValues[11];
    const tenthElement = numericValues[10];

    const { cumulativePrefixNegations } = numericValues.slice(0, 11).reduceRight((accumulatorObject, currentValue, currentIndex) => {
        accumulatorObject.runningTotal += currentValue;
        accumulatorObject.cumulativePrefixNegations[currentIndex] = -accumulatorObject.runningTotal;
        return accumulatorObject;
    }, { runningTotal: 0, cumulativePrefixNegations: Array(11) });

    const finalAccumulatedValue = cumulativePrefixNegations[0];
    const denominatorExpression = tenthElement - eleventhElement;
    
    const scalingFactor = eleventhElement / denominatorExpression;
    const comparisonTarget = finalAccumulatedValue * scalingFactor;

    const searchablePrefixes = cumulativePrefixNegations.slice(0, 10);
    const reversedSearchablePrefixes = searchablePrefixes.slice().reverse();

    const firstMatchFromRightIndex = reversedSearchablePrefixes.findIndex(elementValue => elementValue < -comparisonTarget);

    let finalOutputIndex;
    if (firstMatchFromRightIndex === -1) {
        finalOutputIndex = 0;
    } else {
        const originalArrayPosition = 9 - firstMatchFromRightIndex;
        finalOutputIndex = originalArrayPosition + 1;
    }

    console.log(finalOutputIndex);
});
