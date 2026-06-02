function processInputData(rawData) {
    const numberExtractor = /^(\d+)\s+(\d+)/;
    const matchResult = rawData.match(numberExtractor);

    const [, firstValueString, secondValueString] = matchResult;

    const firstNumericValue = +firstValueString;
    const secondNumericValue = +secondValueString;

    const calculatedDivisor = (secondNumericValue << 1) + 1;

    const finalComputedResult = Math.ceil(firstNumericValue / calculatedDivisor);

    console.log(finalComputedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
