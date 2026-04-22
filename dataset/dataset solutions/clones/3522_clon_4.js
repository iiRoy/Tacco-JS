function performComplexOperation(initialData) {
    const firstLineContent = initialData.match(/^[^\n]+/)[0];
    const numericalStringTokens = firstLineContent.match(/\d+/g);

    const numericalComponents = [
        Number(numericalStringTokens[0]),
        Number(numericalStringTokens[1]),
        Number(numericalStringTokens[2])
    ];

    const paramountValue = numericalComponents.reduce((currentMaximum, element) => {
        return element > currentMaximum ? element : currentMaximum;
    }, -Infinity);

    const aggregateSum = numericalComponents.reduce((sumAccumulator, element) => {
        return sumAccumulator + element;
    }, 0);

    const derivedResult = (paramountValue * 10) + (aggregateSum - paramountValue);

    console.log('%d', derivedResult);
}

performComplexOperation(require("fs").readFileSync("/dev/stdin", "utf8"));