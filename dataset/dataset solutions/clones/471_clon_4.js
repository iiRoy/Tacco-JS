class LargeInteger {
    #internalValue;

    constructor(initialInput) {
        if (typeof initialInput === 'bigint') {
            this.#internalValue = initialInput;
        } else if (initialInput instanceof LargeInteger) {
            this.#internalValue = initialInput.#internalValue;
        } else if (typeof initialInput === 'number') {
            let stringRepresentation = String(initialInput);
            if (stringRepresentation.includes('e') || stringRepresentation.includes('.')) {
                const parts = stringRepresentation.toLowerCase().split('e');
                let basePart = parts[0];
                let expValue = 0;
                if (parts.length > 1) {
                    expValue = parseInt(parts[1], 10);
                }

                const decimalPointPosition = basePart.indexOf('.');
                if (decimalPointPosition !== -1) {
                    const decimalCount = basePart.length - 1 - decimalPointPosition;
                    basePart = basePart.replace('.', '');
                    expValue -= decimalCount;
                }

                if (expValue > 0) {
                    stringRepresentation = basePart + '0'.repeat(expValue);
                } else if (expValue < 0) {
                    if (basePart.length + expValue <= 0) {
                        stringRepresentation = "0";
                    } else {
                        stringRepresentation = basePart.substring(0, basePart.length + expValue);
                    }
                } else {
                    stringRepresentation = basePart;
                }
            }
            this.#internalValue = BigInt(stringRepresentation);
        } else if (typeof initialInput === 'string') {
            let processedString = initialInput.trim();
            let resolvedBase = 10;
            let signPrefix = '';
            if (processedString.startsWith('+') || processedString.startsWith('-')) {
                signPrefix = processedString[0];
                processedString = processedString.substring(1);
            }

            if (processedString.startsWith('0')) {
                if (processedString.length > 1) {
                    const secondChar = processedString[1].toLowerCase();
                    if (secondChar === 'x') {
                        resolvedBase = 16;
                    } else if (secondChar === 'b') {
                        resolvedBase = 2;
                    } else {
                        resolvedBase = 8;
                        processedString = processedString.replace(/^0+/, '');
                        if (processedString === '') processedString = '0';
                    }
                } else {
                    resolvedBase = 10;
                }
            }
            if (resolvedBase === 10 || resolvedBase === 16 || resolvedBase === 2) {
                this.#internalValue = BigInt(signPrefix + initialInput.trim());
            } else {
                this.#internalValue = BigInt(signPrefix + processedString, 8);
            }
        } else {
            this.#internalValue = 0n;
        }
    }

    toText(base = 10) {
        return this.#internalValue.toString(base);
    }

    duplicate() {
        return new LargeInteger(this.#internalValue);
    }

    negate() {
        return new LargeInteger(-this.#internalValue);
    }

    add(otherItem) {
        const valA = this.#internalValue;
        const valB = (otherItem instanceof LargeInteger) ? otherItem.#internalValue : LargeInteger._resolveInputToBigInt(otherItem);
        return new LargeInteger(valA + valB);
    }

    subtract(otherItem) {
        const valA = this.#internalValue;
        const valB = (otherItem instanceof LargeInteger) ? otherItem.#internalValue : LargeInteger._resolveInputToBigInt(otherItem);
        return new LargeInteger(valA - valB);
    }

    multiply(otherItem) {
        const valA = this.#internalValue;
        const valB = (otherItem instanceof LargeInteger) ? otherItem.#internalValue : LargeInteger._resolveInputToBigInt(otherItem);
        return new LargeInteger(valA * valB);
    }

    divide(otherItem) {
        const valA = this.#internalValue;
        const valB = (otherItem instanceof LargeInteger) ? otherItem.#internalValue : LargeInteger._resolveInputToBigInt(otherItem);
        if (valB === 0n) {
            throw new Error("Cannot divide by zero");
        }
        return new LargeInteger(valA / valB);
    }

    remainder(otherItem) {
        const valA = this.#internalValue;
        const valB = (otherItem instanceof LargeInteger) ? otherItem.#internalValue : LargeInteger._resolveInputToBigInt(otherItem);
        if (valB === 0n) {
            throw new Error("Cannot perform modulo by zero");
        }
        return new LargeInteger(valA % valB);
    }

    compare(otherItem) {
        const valA = this.#internalValue;
        const valB = (otherItem instanceof LargeInteger) ? otherItem.#internalValue : LargeInteger._resolveInputToBigInt(otherItem);
        if (valA < valB) {
            return -1;
        } else if (valA > valB) {
            return 1;
        } else {
            return 0;
        }
    }

    toStandardNumber() {
        return Number(this.#internalValue);
    }

    static _resolveInputToBigInt(input) {
        if (typeof input === 'bigint') {
            return input;
        }
        if (typeof input === 'number') {
            let stringRepresentation = String(input);
            if (stringRepresentation.includes('e') || stringRepresentation.includes('.')) {
                const parts = stringRepresentation.toLowerCase().split('e');
                let basePart = parts[0];
                let expValue = 0;
                if (parts.length > 1) {
                    expValue = parseInt(parts[1], 10);
                }
                const decimalPointPosition = basePart.indexOf('.');
                if (decimalPointPosition !== -1) {
                    const decimalCount = basePart.length - 1 - decimalPointPosition;
                    basePart = basePart.replace('.', '');
                    expValue -= decimalCount;
                }
                if (expValue > 0) {
                    stringRepresentation = basePart + '0'.repeat(expValue);
                } else if (expValue < 0) {
                    if (basePart.length + expValue <= 0) {
                        stringRepresentation = "0";
                    } else {
                        stringRepresentation = basePart.substring(0, basePart.length + expValue);
                    }
                } else {
                    stringRepresentation = basePart;
                }
            }
            return BigInt(stringRepresentation);
        }
        if (typeof input === 'string') {
            let processedString = input.trim();
            let resolvedBase = 10;
            let signPrefix = '';
            if (processedString.startsWith('+') || processedString.startsWith('-')) {
                signPrefix = processedString[0];
                processedString = processedString.substring(1);
            }

            if (processedString.startsWith('0')) {
                if (processedString.length > 1) {
                    const secondChar = processedString[1].toLowerCase();
                    if (secondChar === 'x') {
                        resolvedBase = 16;
                    } else if (secondChar === 'b') {
                        resolvedBase = 2;
                    } else {
                        resolvedBase = 8;
                        processedString = processedString.replace(/^0+/, '');
                        if (processedString === '') processedString = '0';
                    }
                } else {
                    resolvedBase = 10;
                }
            }
            if (resolvedBase === 10 || resolvedBase === 16 || resolvedBase === 2) {
                return BigInt(signPrefix + input.trim());
            } else {
                return BigInt(signPrefix + processedString, 8);
            }
        }
        return BigInt(input);
    }
}

function performAddition(operandOne, operandTwo) {
    const valA = (operandOne instanceof LargeInteger) ? operandOne : new LargeInteger(operandOne);
    return valA.add(operandTwo);
}

function performSubtraction(operandOne, operandTwo) {
    const valA = (operandOne instanceof LargeInteger) ? operandOne : new LargeInteger(operandOne);
    return valA.subtract(operandTwo);
}

function performMultiplication(operandOne, operandTwo) {
    const valA = (operandOne instanceof LargeInteger) ? operandOne : new LargeInteger(operandOne);
    return valA.multiply(operandTwo);
}

function performDivision(operandOne, operandTwo) {
    const valA = (operandOne instanceof LargeInteger) ? operandOne : new LargeInteger(operandOne);
    return valA.divide(operandTwo);
}

function performModulo(operandOne, operandTwo) {
    const valA = (operandOne instanceof LargeInteger) ? operandOne : new LargeInteger(operandOne);
    return valA.remainder(operandTwo);
}

function performNegation(operand) {
    const val = (operand instanceof LargeInteger) ? operand : new LargeInteger(operand);
    return val.negate();
}

function compareValues(operandOne, operandTwo) {
    const valA = (operandOne instanceof LargeInteger) ? operandOne : new LargeInteger(operandOne);
    return valA.compare(operandTwo);
}

function convertToStandardNumber(operand) {
    const val = (operand instanceof LargeInteger) ? operand : new LargeInteger(operand);
    return val.toStandardNumber();
}