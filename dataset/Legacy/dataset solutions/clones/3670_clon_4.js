function GiantValue(val, basis = 1000) {
    this.parts = [];
    this.polarity = 0;
    this.digitBase = basis;

    const convertInput = (input) => {
        if (typeof input === 'number') {
            if (input === 0) return { parts: [0], polarity: 0 };
            let current = Math.abs(input);
            const newParts = [];
            while (current > 0) {
                newParts.push(current % this.digitBase);
                current = Math.floor(current / this.digitBase);
            }
            return { parts: newParts.length > 0 ? newParts : [0], polarity: input > 0 ? 1 : -1 };
        } else if (typeof input === 'string') {
            if (input === "0") return { parts: [0], polarity: 0 };
            let str = input;
            let currentPolarity = 1;
            if (str[0] === '-') {
                currentPolarity = -1;
                str = str.substring(1);
            } else if (str[0] === '+') {
                str = str.substring(1);
            }
            if (!/^\d+$/.test(str)) throw new Error("Invalid numeric string representation");

            let currentVal = GiantValue.numericZero;
            const baseTen = new GiantValue(10, this.digitBase);

            for (let k = 0; k < str.length; k++) {
                currentVal = currentVal.multiply(baseTen);
                currentVal = currentVal.add(new GiantValue(parseInt(str[k]), this.digitBase));
            }
            return { parts: currentVal.parts, polarity: currentVal.isZero() ? 0 : currentPolarity };
        } else if (input instanceof GiantValue) {
            return { parts: [...input.parts], polarity: input.polarity };
        }
        throw new Error("Unsupported input type for GiantValue creation");
    };

    const initial = convertInput(val);
    this.parts = initial.parts;
    this.polarity = initial.polarity;

    this.prune();
}

GiantValue.prototype.prune = function() {
    while (this.parts.length > 1 && this.parts[this.parts.length - 1] === 0) {
        this.parts.pop();
    }
    if (this.parts.length === 1 && this.parts[0] === 0) {
        this.polarity = 0;
    }
    return this;
};

GiantValue.prototype.isZero = function() {
    return this.polarity === 0;
};

GiantValue.prototype.absolute = function() {
    const newRepresentation = new GiantValue(0, this.digitBase);
    newRepresentation.parts = [...this.parts];
    newRepresentation.polarity = this.isZero() ? 0 : 1;
    return newRepresentation;
};

GiantValue.prototype.negate = function() {
    const newRepresentation = new GiantValue(0, this.digitBase);
    newRepresentation.parts = [...this.parts];
    newRepresentation.polarity = -this.polarity;
    return newRepresentation;
};

GiantValue.prototype.compareMagnitude = function(other) {
    if (this.parts.length !== other.parts.length) {
        return this.parts.length > other.parts.length ? 1 : -1;
    }
    for (let k = this.parts.length - 1; k >= 0; k--) {
        if (this.parts[k] !== other.parts[k]) {
            return this.parts[k] > other.parts[k] ? 1 : -1;
        }
    }
    return 0;
};

GiantValue.prototype.compareOverall = function(other) {
    if (this.polarity !== other.polarity) {
        return this.polarity > other.polarity ? 1 : -1;
    }
    if (this.polarity === 0) return 0;

    const magnitudeComparison = this.compareMagnitude(other);
    return this.polarity * magnitudeComparison;
};

GiantValue.prototype.isLessThan = function(other) { return this.compareOverall(other) < 0; };
GiantValue.prototype.isLessOrEqual = function(other) { return this.compareOverall(other) <= 0; };
GiantValue.prototype.isGreaterThan = function(other) { return this.compareOverall(other) > 0; };
GiantValue.prototype.isGreaterOrEqual = function(other) { return this.compareOverall(other) >= 0; };
GiantValue.prototype.isEqualTo = function(other) { return this.compareOverall(other) === 0; };

GiantValue.prototype.add = function(other) {
    if (this.isZero()) return other.absolute();
    if (other.isZero()) return this.absolute();

    if (this.polarity !== other.polarity) {
        const absA = this.absolute();
        const absB = other.absolute();
        if (absA.compareMagnitude(absB) >= 0) {
            const res = absA.subtract(absB);
            res.polarity = this.polarity;
            return res;
        } else {
            const res = absB.subtract(absA);
            res.polarity = other.polarity;
            return res;
        }
    }

    const resultParts = [];
    const maxLength = Math.max(this.parts.length, other.parts.length);
    let carry = 0;

    for (let k = 0; k < maxLength || carry > 0; k++) {
        const digitA = this.parts[k] || 0;
        const digitB = other.parts[k] || 0;
        const sum = digitA + digitB + carry;
        resultParts.push(sum % this.digitBase);
        carry = Math.floor(sum / this.digitBase);
    }

    const result = new GiantValue(0, this.digitBase);
    result.parts = resultParts;
    result.polarity = this.polarity;
    return result.prune();
};

GiantValue.prototype.subtract = function(other) {
    if (this.isZero()) return other.negate();
    if (other.isZero()) return this.absolute();

    if (this.polarity !== other.polarity) {
        const res = this.absolute().add(other.absolute());
        res.polarity = this.polarity;
        return res;
    }

    const absA = this.absolute();
    const absB = other.absolute();
    let resultPolarity = this.polarity;

    let largerAbs, smallerAbs;
    const magCmp = absA.compareMagnitude(absB);
    if (magCmp === 0) return new GiantValue(0, this.digitBase);
    if (magCmp > 0) {
        largerAbs = absA;
        smallerAbs = absB;
    } else {
        largerAbs = absB;
        smallerAbs = absA;
        resultPolarity = -this.polarity;
    }

    const resultParts = [];
    let borrow = 0;
    for (let k = 0; k < largerAbs.parts.length; k++) {
        const digitA = largerAbs.parts[k] || 0;
        const digitB = smallerAbs.parts[k] || 0;
        let diff = digitA - digitB - borrow;
        if (diff < 0) {
            diff += this.digitBase;
            borrow = 1;
        } else {
            borrow = 0;
        }
        resultParts.push(diff);
    }

    const result = new GiantValue(0, this.digitBase);
    result.parts = resultParts;
    result.polarity = resultPolarity;
    return result.prune();
};

GiantValue.prototype.multiply = function(other) {
    if (this.isZero() || other.isZero()) return new GiantValue(0, this.digitBase);

    const absA = this.absolute();
    const absB = other.absolute();
    const resultPolarity = (this.polarity === other.polarity) ? 1 : -1;

    const productParts = Array(absA.parts.length + absB.parts.length).fill(0);

    for (let i = 0; i < absA.parts.length; i++) {
        let carry = 0;
        for (let j = 0; j < absB.parts.length || carry > 0; j++) {
            const digitA = absA.parts[i];
            const digitB = absB.parts[j] || 0;
            const currentProduct = productParts[i + j] + digitA * digitB + carry;
            productParts[i + j] = currentProduct % this.digitBase;
            carry = Math.floor(currentProduct / this.digitBase);
        }
    }

    const result = new GiantValue(0, this.digitBase);
    result.parts = productParts;
    result.polarity = resultPolarity;
    return result.prune();
};

GiantValue.prototype.divmod = function(other) {
    if (other.isZero()) throw new Error("Division by zero");
    if (this.isZero()) return { quotient: GiantValue.numericZero, remainder: GiantValue.numericZero };

    const absThis = this.absolute();
    const absOther = other.absolute();

    if (absThis.compareMagnitude(absOther) < 0) {
        return { quotient: GiantValue.numericZero, remainder: this };
    }
    if (absThis.compareMagnitude(absOther) === 0) {
        return { quotient: (this.polarity === other.polarity) ? GiantValue.numericOne : GiantValue.numericNegativeOne, remainder: GiantValue.numericZero };
    }

    const quotientPolarity = (this.polarity === other.polarity) ? 1 : -1;
    const remainderPolarity = this.polarity;

    let currentAccumulator = GiantValue.numericZero;
    let quotientParts = [];

    const reversedThisParts = [...absThis.parts].reverse();

    for (let i = 0; i < reversedThisParts.length; i++) {
        currentAccumulator = currentAccumulator.multiply(new GiantValue(this.digitBase, this.digitBase));
        currentAccumulator = currentAccumulator.add(new GiantValue(reversedThisParts[i], this.digitBase));

        let currentQuotientDigit = 0;
        while (currentAccumulator.isGreaterOrEqual(absOther)) {
            currentAccumulator = currentAccumulator.subtract(absOther);
            currentQuotientDigit++;
        }
        quotientParts.push(currentQuotientDigit);
    }

    const quotientResult = GiantValue.create(0);
    quotientResult.parts = quotientParts.reverse();
    quotientResult.polarity = quotientPolarity;
    quotientResult.prune();

    const remainderResult = currentAccumulator;
    remainderResult.polarity = remainderResult.isZero() ? 0 : remainderPolarity;
    remainderResult.prune();

    return { quotient: quotientResult, remainder: remainderResult };
};

GiantValue.prototype.quotient = function(other) {
    return this.divmod(other).quotient;
};

GiantValue.prototype.remainder = function(other) {
    const { remainder } = this.divmod(other);
    if (this.polarity === -1 && remainder.polarity === 1 && !remainder.isZero()) {
        return remainder.subtract(other.absolute());
    }
    return remainder;
};

GiantValue.findGCD = function(numA, numB) {
    let a = numA.absolute();
    let b = numB.absolute();

    if (a.isZero()) return b;
    if (b.isZero()) return a;

    const { remainder } = b.divmod(a);
    return GiantValue.findGCD(remainder, a);
};

GiantValue.prototype.toText = function() {
    if (this.isZero()) return "0";
    const sign = this.polarity === -1 ? "-" : "";
    let str = "";
    for (let k = this.parts.length - 1; k >= 0; k--) {
        let partStr = this.parts[k].toString();
        if (k < this.parts.length - 1) {
            partStr = "0".repeat(this.digitBase.toString().length - 1 - partStr.length) + partStr;
        }
        str += partStr;
    }
    return sign + str;
};

GiantValue.create = function(value) {
    if (value instanceof GiantValue) return value;
    if (typeof value === 'number' || typeof value === 'string') {
        return new GiantValue(value);
    }
    throw new Error("Invalid value for GiantValue.create");
};

GiantValue.numericZero = new GiantValue(0);
GiantValue.numericOne = new GiantValue(1);
GiantValue.numericNegativeOne = new GiantValue(-1);

function ExecuteComputation(inputData) {
    const lines = inputData.split("\n").filter(l => l.trim() !== '');

    let currentLineIndex = 0;
    const retrieveNextLine = () => lines[currentLineIndex++];

    const totalCases = parseInt(retrieveNextLine());

    let caseCounter = 0;
    while (caseCounter < totalCases) {
        const parameters = retrieveNextLine().split(" ");
        const primaryValue = GiantValue.create(parameters[0]);
        const firstDivisor = GiantValue.create(parameters[1]);
        const capValue = GiantValue.create(parameters[2]);
        const secondDivisor = GiantValue.create(parameters[3]);

        if (primaryValue.isLessThan(firstDivisor) || secondDivisor.isLessThan(firstDivisor)) {
            console.log("No");
            caseCounter++;
            continue;
        }

        if (firstDivisor.isLessThan(capValue)) {
            console.log("Yes");
            caseCounter++;
            continue;
        }

        let currentRemainder = primaryValue.remainder(firstDivisor);

        if (capValue.isLessThan(currentRemainder)) {
            console.log("No");
            caseCounter++;
            continue;
        }

        const commonDivisor = GiantValue.findGCD(firstDivisor, secondDivisor);

        currentRemainder = currentRemainder.remainder(commonDivisor);

        const calculationStep1 = capValue.subtract(currentRemainder);
        const calculationStep2 = calculationStep1.quotient(commonDivisor);
        const calculationStep3 = calculationStep2.multiply(commonDivisor);
        const calculationStep4 = calculationStep3.add(currentRemainder);
        const finalCheckValue = calculationStep4.add(commonDivisor);

        if (finalCheckValue.isLessThan(firstDivisor)) {
            console.log("No");
        } else {
            console.log("Yes");
        }
        caseCounter++;
    }
}
ExecuteComputation(require("fs").readFileSync("/dev/stdin","utf8"));