const fileSystemInterface = require('fs').promises;

class InputTokenizer {
    constructor(sourceText) {
        this.tokenExpressions = [...sourceText.matchAll(/\S+/g)];
        this.currentTokenIndex = 0;
    }

    retrieveNextToken() {
        if (this.currentTokenIndex < this.tokenExpressions.length) {
            return this.tokenExpressions[this.currentTokenIndex++][0];
        }
        return undefined;
    }
}

class BinaryRepresentation {
    constructor(initialQuantity) {
        if (typeof initialQuantity === 'number') {
            if (initialQuantity < 0) {
                throw new Error("Negative numerical quantities are not supported.");
            }
            this.internalValue = BigInt(initialQuantity);
        } else if (typeof initialQuantity === 'string') {
            if (initialQuantity.match(/^[01]+$/)) { // Appears to be a binary string
                this.internalValue = BigInt("0b" + initialQuantity);
            } else { // Assume decimal string
                this.internalValue = BigInt(initialQuantity);
            }
        } else if (typeof initialQuantity === 'bigint') {
            this.internalValue = initialQuantity;
        } else {
            throw new Error("Unsupported initial quantity type for BinaryRepresentation.");
        }
    }

    static combineBinaryValues(firstOperand, secondOperand, operationSymbol) {
        let outcome;
        switch (operationSymbol) {
            case '&': outcome = firstOperand.internalValue & secondOperand.internalValue; break;
            case '|': outcome = firstOperand.internalValue | secondOperand.internalValue; break;
            case '^': outcome = firstOperand.internalValue ^ secondOperand.internalValue; break;
            default: throw new Error("Invalid bitwise operation symbol.");
        }
        return new BinaryRepresentation(outcome);
    }

    performUnion(otherRepresentation) {
        return BinaryRepresentation.combineBinaryValues(this, otherRepresentation, '|');
    }

    performIntersection(otherRepresentation) {
        return BinaryRepresentation.combineBinaryValues(this, otherRepresentation, '&');
    }

    performExclusiveOr(otherRepresentation) {
        return BinaryRepresentation.combineBinaryValues(this, otherRepresentation, '^');
    }

    isEquivalentToZero() {
        return this.internalValue === 0n;
    }

    toStandardNumber() {
        if (this.internalValue > Number.MAX_SAFE_INTEGER) {
            // For a Type IV clone, replicating exact behavior including potential JS number limits is key.
            // Original BigBit.toNumber() also uses Math.pow(2,n) which has limits.
            // This warning is for clarity, but the conversion will happen.
            console.warn("Binary representation exceeds JavaScript's safe integer limit; precision may be lost.");
        }
        return Number(this.internalValue);
    }

    toBinaryStringForm() {
        return this.internalValue.toString(2);
    }
}

async function mainExecutionFlow() {
    const rawData = await fileSystemInterface.readFile('/dev/stdin', 'utf8');
    const inputSequencer = new InputTokenizer(rawData);

    const getNextParsedInteger = () => {
        const token = inputSequencer.retrieveNextToken();
        if (token === undefined) {
            throw new Error("End of input stream reached prematurely.");
        }
        return parseInt(token, 10);
    };

    const totalCount = getNextParsedInteger();
    const initialBinaryEntity = new BinaryRepresentation(getNextParsedInteger());

    const collectionOfEntities = new Array(totalCount);
    for (let current = 0; current < totalCount; current++) {
        collectionOfEntities[current] = new BinaryRepresentation(getNextParsedInteger());
    }

    // The original code concludes here without any explicit output or further action.
    // This clone replicates that exact behavior.
}

mainExecutionFlow().catch(error => {
    console.error("Execution encountered an error:", error);
    process.exit(1);
});