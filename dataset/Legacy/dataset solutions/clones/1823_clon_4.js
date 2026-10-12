const processInput = (rawText) => {
    const lineSegments = rawText.trim().split('\n');
    const [initialCount, ...dataLines] = lineSegments;
    const elementCount = Number(initialCount);

    const { primaryValues, secondaryValues } = dataLines.reduce((acc, currentLine) => {
        const [firstNum, secondNum] = currentLine.split(' ').map(Number);
        acc.primaryValues.push(firstNum);
        acc.secondaryValues.push(secondNum);
        return acc;
    }, { primaryValues: [], secondaryValues: [] });

    primaryValues.sort((x, y) => x - y);
    secondaryValues.sort((x, y) => x - y);

    const lowerMid = Math.floor((elementCount - 1) / 2);
    const upperMid = Math.ceil((elementCount - 1) / 2);

    const finalResult = (secondaryValues[lowerMid] - primaryValues[lowerMid]) +
                        (elementCount % 2 === 0 ? (secondaryValues[upperMid] - primaryValues[upperMid]) : 0) + 1;

    return finalResult;
};

console.log(processInput(require('fs').readFileSync('/dev/stdin', 'utf8')));
