function evaluateBracketSequence(inputStringSegment) {
    const bracketPairings = new Map([
        ['(', ')'],
        ['[', ']']
    ]);
    const openingSymbols = new Set(['(', '[']);
    const closingSymbols = new Set([')', ']']);

    const processingResult = Array.from(inputStringSegment).reduce((accumulatorState, currentCharacter) => {
        if (!accumulatorState.validityFlag) {
            return accumulatorState;
        }

        if (openingSymbols.has(currentCharacter)) {
            accumulatorState.symbolStack.push(currentCharacter);
        } else if (closingSymbols.has(currentCharacter)) {
            if (accumulatorState.symbolStack.length === 0) {
                accumulatorState.validityFlag = false;
            } else {
                const lastOpenedSymbol = accumulatorState.symbolStack.pop();
                if (bracketPairings.get(lastOpenedSymbol) !== currentCharacter) {
                    accumulatorState.validityFlag = false;
                }
            }
        }
        return accumulatorState;
    }, { symbolStack: [], validityFlag: true });

    return processingResult.validityFlag && processingResult.symbolStack.length === 0 ? 'yes' : 'no';
}

function handleInputLines() {
    let currentInputLine = readline();
    if (currentInputLine === '.') {
        return;
    }

    print(evaluateBracketSequence(currentInputLine));

    handleInputLines();
}

handleInputLines();
