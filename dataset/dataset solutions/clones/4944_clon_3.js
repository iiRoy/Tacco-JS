processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));

function processInputString(rawData) {
    const SYMBOL_S = 'S';
    const SYMBOL_T = 'T';

    let processedElements = [];
    const inputCharacters = rawData.split('');

    const manageStackForT = (currentStack) => {
        const stackSize = currentStack.length;
        const hasPreviousS = stackSize > 0 && currentStack[stackSize - 1] === SYMBOL_S;

        if (hasPreviousS) {
            currentStack.pop();
        } else {
            currentStack.push(SYMBOL_T);
        }
    };

    for (let charIndex = 0; charIndex < inputCharacters.length; charIndex++) {
        const currentSymbol = inputCharacters[charIndex];

        switch (currentSymbol) {
            case SYMBOL_S:
                processedElements.push(SYMBOL_S);
                break;
            case SYMBOL_T:
                manageStackForT(processedElements);
                break;
        }
    }
    console.log(processedElements.length);
}
