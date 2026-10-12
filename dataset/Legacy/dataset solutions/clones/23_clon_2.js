require("fs").readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .some(function(lineContent) {
        valueStrings = lineContent.split(' ');
        firstNum = valueStrings[0];
        secondNum = valueStrings[1];
        productOfNums = firstNum * secondNum;
        while (moduloResult = firstNum % secondNum) {
            firstNum = secondNum;
            secondNum = moduloResult;
        }
        console.log(secondNum, productOfNums / secondNum);
    });
