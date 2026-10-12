function createInputParser(rawSource) {
    const dataTokens = rawSource.split(/\s+/).filter(Boolean);
    let currentTokenIndex = 0;

    function getNextStringToken() {
        if (currentTokenIndex >= dataTokens.length) {
            throw new Error("Input stream exhausted.");
        }
        return dataTokens[currentTokenIndex++];
    }

    function getNextNumericToken() {
        const tokenValue = getNextStringToken();
        const parsedNumber = Number(tokenValue);
        if (isNaN(parsedNumber)) {
            throw new Error(`Invalid numeric format encountered: ${tokenValue}`);
        }
        return parsedNumber;
    }

    return {
        readInteger: getNextNumericToken
    };
}

function outputResultWithDoubleNewline(valueToPrint) {
    console.log(valueToPrint + "\n");
}

function processAndCalculate(sourceData) {
    const dataReader = createInputParser(sourceData);

    const firstOperand = dataReader.readInteger();
    const secondOperand = dataReader.readInteger();

    const reciprocalSum = (1 / firstOperand) + (1 / secondOperand);
    const finalResult = 1 / reciprocalSum;

    const formattedOutput = finalResult.toFixed(10);

    outputResultWithDoubleNewline(formattedOutput);
}

function executeDebugMode() {
    if (typeof document !== 'undefined' && document.getElementById("input")) {
        processAndCalculate(document.getElementById("input").value);
    } else {
        console.error("Debug mode requires a DOM environment with an 'input' element.");
    }
}

processAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
