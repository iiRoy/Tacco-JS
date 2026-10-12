const transformString = (inputStr, budget) => {
    let currentBudget = budget;
    let processedChars = [];
    let charPointer = 0;

    while (charPointer < inputStr.length) {
        const currentSymbol = inputStr[charPointer];
        const isTerminalSymbol = (charPointer === inputStr.length - 1);

        if (currentBudget === 0) {
            processedChars.push(inputStr.substring(charPointer));
            break;
        }

        if (currentSymbol === 'a') {
            processedChars.push('a');
        } else {
            const symbolCode = currentSymbol.charCodeAt(0);
            const symbolPosition = symbolCode - 97;
            const conversionCost = (26 - symbolPosition) % 26;

            if (conversionCost <= currentBudget) {
                processedChars.push('a');
                currentBudget -= conversionCost;
            } else {
                if (isTerminalSymbol) {
                    const finalSymbolCode = symbolCode + currentBudget;
                    processedChars.push(String.fromCharCode(finalSymbolCode));
                    currentBudget = 0;
                } else {
                    processedChars.push(currentSymbol);
                }
            }
        }
        charPointer++;
    }
    return processedChars.join('');
};

function Main(rawInput) {
  const [firstLine, secondLine] = rawInput.split("\n");
  const sourceString = firstLine;
  const shiftValue = parseInt(secondLine, 10);

  console.log(transformString(sourceString, shiftValue));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
