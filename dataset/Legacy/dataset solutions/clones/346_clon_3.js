(function (rawData) {
    let expressionString;
    let charPointer;

    function evaluateExpression() {
        let resultVal = processTerm();

        let keepProcessing = true;
        while (keepProcessing) {
            let currentOperator = expressionString[charPointer];
            if (currentOperator === "+") {
                charPointer++;
                resultVal = resultVal + processTerm();
            } else if (currentOperator === "-") {
                charPointer++;
                resultVal = resultVal - processTerm();
            } else {
                keepProcessing = false;
            }
        }
        return resultVal;
    }

    function processTerm() {
        let termResult = handleParentheses();

        let continueTermProcessing = true;
        while (continueTermProcessing) {
            let opChar = expressionString[charPointer];
            if (opChar === "*") {
                charPointer++;
                termResult = Math.floor(termResult * handleParentheses());
            } else if (opChar === "/") {
                charPointer++;
                termResult = Math.floor(termResult / handleParentheses());
            } else {
                continueTermProcessing = false;
            }
        }
        return termResult;
    }

    function handleParentheses() {
        let bracketValue;
        let charAtPointer = expressionString[charPointer];

        if (charAtPointer === "(") {
            charPointer++;
            bracketValue = evaluateExpression();
            charPointer++;
        } else {
            bracketValue = parseNumber();
        }
        return bracketValue;
    }

    function parseNumber() {
        let parsedNum = 0;
        let currentDigitChar;

        while ((currentDigitChar = expressionString[charPointer]) && currentDigitChar.match(/[0-9]/)) {
            let digitValue = parseInt(currentDigitChar, 10);
            parsedNum = (parsedNum * 10) + digitValue;
            charPointer++;
        }
        return parsedNum;
    }

    const inputLines = rawData.replace(/\r/g, '').split("\n");
    let testCaseCount = parseInt(inputLines.shift(), 10);

    for (let i = 0; i < testCaseCount; i++) {
        let rawExpressionLine = inputLines.shift();
        expressionString = rawExpressionLine.replace(/\s/g, "");
        charPointer = 0;

        console.log(evaluateExpression());
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
