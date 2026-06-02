function processInputAndCompare(inputLines) {
    const firstLineContent = inputLines[0];

    const parsedValues = firstLineContent.split(" ");

    const firstOperand = Number(parsedValues[0]);
    const secondOperand = Number(parsedValues[1]);
    const thirdOperand = Number(parsedValues[2]);
    const fourthOperand = Number(parsedValues[3]);

    const sumOfLeftPair = firstOperand + secondOperand;
    const sumOfRightPair = thirdOperand + fourthOperand;

    function determineBalanceStatus(leftSideTotal, rightSideTotal) {
        if (leftSideTotal === rightSideTotal) {
            return "Balanced";
        } else if (leftSideTotal > rightSideTotal) {
            return "Left";
        } else {
            return "Right";
        }
    }

    const finalStatus = determineBalanceStatus(sumOfLeftPair, sumOfRightPair);
    
    console.log(finalStatus);
}

processInputAndCompare(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
