const evaluateConditions = (firstOperand, secondOperand, commonComparator) => {
    const isFirstValueLessThanComparator = firstOperand < commonComparator;
    const isSecondValueLessThanComparator = secondOperand < commonComparator;
    return isFirstValueLessThanComparator && isSecondValueLessThanComparator;
};

function processInputData(rawData){
    const parsedLines = rawData.split('\n');

    const firstLineValue = parsedLines[0];
    const fifthLineValue = parsedLines[4];
    const sixthLineValue = parsedLines[5];

    const finalDecision = evaluateConditions(firstLineValue, fifthLineValue, sixthLineValue);

    const outputResult = finalDecision ? 'Yay!' : ':(';

    console.log(outputResult);
}

processInputData(require("fs").readFileSync("/dev/stdin","utf8"));
