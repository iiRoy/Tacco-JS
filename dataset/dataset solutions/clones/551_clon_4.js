((inputContent) => {
    const allInputLines = inputContent.split('\n');

    const mappingCount = Number(allInputLines[0]);

    const mappingSourceLines = allInputLines.slice(1, 1 + mappingCount);

    const valueMapper = mappingSourceLines.reduce((accumulatorMap, currentSourceLine) => {
        const lineSegments = currentSourceLine.split(' ');
        accumulatorMap.set(lineSegments[0], lineSegments[1]);
        return accumulatorMap;
    }, new Map());

    const queryTargetLines = allInputLines.slice(1 + mappingCount + 1);

    const resultSegments = queryTargetLines.map(targetKey => valueMapper.get(targetKey) ?? targetKey);

    console.log(resultSegments.join('') + '\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
