const processInputAndDisplayResult = (operationString) => {
    const firstValue = Number(operationString.charAt(0));
    const operatorChar = operationString.charAt(2);
    const secondValue = Number(operationString.charAt(4));

    const operationDispatch = {
        '+': (valA, valB) => valA + valB,
        '-': (valA, valB) => valA - valB,
    };

    const chosenOperation = operationDispatch[operatorChar];

    if (chosenOperation) {
        console.log(chosenOperation(firstValue, secondValue));
    }
};

processInputAndDisplayResult(require("fs").readFileSync("/dev/stdin", "utf8"));
