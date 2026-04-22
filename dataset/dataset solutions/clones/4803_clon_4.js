let operationResolver = new Map();
operationResolver.set('+', (val1, val2) => val1 + val2);
operationResolver.set('-', (val1, val2) => val1 - val2);

function processInput(fullText) {
    let firstDigit = Number(fullText.charAt(0));
    let actionSymbol = fullText.charAt(2);
    let secondDigit = Number(fullText.charAt(4));

    let chosenAction = operationResolver.get(actionSymbol);
    if (chosenAction) {
        let computedValue = chosenAction(firstDigit, secondDigit);
        console.log(computedValue);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));