const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceContent.trim().split("\n");

const initialQuantity = parseInt(processedLines.shift());

class EntryUnit {
    constructor(identifier, amount) {
        this.identifier = identifier;
        this.amount = amount;
    }
}

const processingResult = processedLines.reduce((state, currentLine, index) => {
    if (state.errorDetected) {
        return state;
    }

    const lineComponents = currentLine.split(" ");
    const currentIdentifier = lineComponents[0];
    const currentAmount = parseInt(lineComponents[1]);

    if (index === 0 && currentIdentifier === ")") {
        state.errorDetected = true;
        return state;
    }

    if (state.lastPushedIdentifier === currentIdentifier && currentIdentifier === "(") {
        const lastUnit = state.elementCollection[state.elementCollection.length - 1];
        if (lastUnit && lastUnit.identifier === "(") {
            lastUnit.amount += currentAmount;
        } else {
            state.errorDetected = true;
        }
    } else {
        if (currentIdentifier === "(") {
            state.elementCollection.push(new EntryUnit(currentIdentifier, currentAmount));
            state.lastPushedIdentifier = currentIdentifier;
        } else {
            const lastUnit = state.elementCollection[state.elementCollection.length - 1];

            if (!lastUnit || lastUnit.identifier === ")") {
                state.elementCollection.push(new EntryUnit(currentIdentifier, currentAmount));
            } else {
                const openerAmount = lastUnit.amount;

                if (openerAmount > currentAmount) {
                    lastUnit.amount -= currentAmount;
                } else if (openerAmount < currentAmount) {
                    state.elementCollection.pop();
                    const remainingCloserAmount = currentAmount - openerAmount;
                    state.elementCollection.push(new EntryUnit(currentIdentifier, remainingCloserAmount));
                } else {
                    state.elementCollection.pop();
                }
            }
        }
    }
    return state;
}, { elementCollection: [], lastPushedIdentifier: '', errorDetected: false });

if (processingResult.errorDetected || processingResult.elementCollection.length > 0) {
    console.log("NO");
} else {
    console.log("YES");
}