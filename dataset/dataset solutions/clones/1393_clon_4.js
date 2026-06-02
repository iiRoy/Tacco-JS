(function(sourceData){
    const numberExtractor = /(\d+)\s+(\d+)/;
    const parsedValues = sourceData.match(numberExtractor);

    const firstOperand = Number(parsedValues[1]);
    const secondOperand = Number(parsedValues[2]);

    const integerQuotient = Math.trunc(firstOperand / secondOperand);

    const calculatedRemainder = firstOperand - integerQuotient * secondOperand;

    const preciseResult = firstOperand / secondOperand;
    const scaledResult = Math.round(preciseResult * 1000000);
    const wholePart = Math.trunc(scaledResult / 1000000);
    let decimalPart = Math.abs(scaledResult % 1000000).toString();

    while (decimalPart.length < 6) {
        decimalPart = '0' + decimalPart;
    }

    const formattedDecimal = `${wholePart}.${decimalPart}`;

    console.log(`${integerQuotient} ${calculatedRemainder} ${formattedDecimal}`);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
