const numeralValueMap = new Map([
    ['I', 1], ['V', 5], ['X', 10], ['L', 50], ['C', 100], ['D', 500], ['M', 1000]
]);

const calculateRomanValue = (inputSegment) => {
    if (!inputSegment) {
        return 0;
    }

    let accumulatedTotal = 0;
    let previousSymbolValue = 0;

    for (let currentPosition = inputSegment.length - 1; currentPosition >= 0; currentPosition--) {
        const currentSymbolChar = inputSegment[currentPosition];
        const currentSymbolNumeric = numeralValueMap.get(currentSymbolChar);

        if (currentSymbolNumeric < previousSymbolValue) {
            accumulatedTotal -= currentSymbolNumeric;
        } else {
            accumulatedTotal += currentSymbolNumeric;
        }
        previousSymbolValue = currentSymbolNumeric;
    }
    return accumulatedTotal;
};

const entireInput = require("fs").readFileSync("/dev/stdin", "utf8");

let lineCharacters = [];
let inputIndex = 0;

while (inputIndex < entireInput.length) {
    const currentInputChar = entireInput[inputIndex];

    if (currentInputChar === '\n') {
        const currentRomanString = lineCharacters.join('');
        console.log(calculateRomanValue(currentRomanString));
        lineCharacters = [];
    } else {
        lineCharacters.push(currentInputChar);
    }
    inputIndex++;
}
