function calculateAndLog(rawInputContent) {
    const LINE_DELIMITER = "\n";
    const firstRelevantLine = rawInputContent.split(LINE_DELIMITER)[0];

    const VALUE_DELIMITER = " ";
    const stringValues = firstRelevantLine.split(VALUE_DELIMITER);

    const firstOperand = Number(stringValues[0]);
    const secondOperand = Number(stringValues[1]);

    const dividedSecondOperand = secondOperand / 2;

    const finalSum = firstOperand + dividedSecondOperand;

    console.log(finalSum);
}

calculateAndLog(require('fs').readFileSync('/dev/stdin', 'utf8'));
