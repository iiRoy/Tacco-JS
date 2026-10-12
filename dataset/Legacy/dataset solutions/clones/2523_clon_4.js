const processInput = (sourceData) => {
    const lineSegments = sourceData.split('\n');

    const primaryTokens = lineSegments[0].split(' ');
    const secondaryTokens = lineSegments[1].split(' '); // This variable is equivalent to 'moke' and is unused, but its parsing is preserved.

    const iterationBound = Number(primaryTokens[0]);
    const comparisonValue = Number(primaryTokens[1]);

    const matchingElementsCount = primaryTokens
        .slice(0, iterationBound)
        .filter(itemString => Number(itemString) <= comparisonValue)
        .length;

    console.log(matchingElementsCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
