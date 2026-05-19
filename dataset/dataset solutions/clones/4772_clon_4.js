const fileSystem = require("fs");

class ArbitraryPrecisionNumber {
    constructor(value) {
        this.digits = [];
        this.sign = 1;

        if (typeof value === 'number') {
            if (value === 0) {
                this.digits = [0];
                this.sign = 1;
                return;
            }
            if (value < 0) {
                this.sign = -1;
                value = -value;
            }
            this.digits = String(value).split('').map(Number);
        } else if (typeof value === 'string') {
            if (value === '0') {
                this.digits = [0];
                this.sign = 1;
                return;
            }
            if (value.startsWith('-')) {
                this.sign = -1;
                value = value.substring(1);
            }
            this.digits = value.split('').map(Number);
        } else if (value instanceof ArbitraryPrecisionNumber) {
            this.digits = [...value.digits];
            this.sign = value.sign;
        } else {
            throw new Error("Invalid constructor argument for ArbitraryPrecisionNumber");
        }
        this._trimLeadingZeros();
    }

    _trimLeadingZeros() {
        while (this.digits.length > 1 && this.digits[0] === 0) {
            this.digits.shift();
        }
        if (this.digits.length === 1 && this.digits[0] === 0) {
            this.sign = 1;
        }
    }

    toString() {
        if (this.digits.length === 1 && this.digits[0] === 0) {
            return '0';
        }
        return (this.sign === -1 ? '-' : '') + this.digits.join('');
    }

    _compareAbsolute(other) {
        if (this.digits.length !== other.digits.length) {
            return this.digits.length > other.digits.length ? 1 : -1;
        }
        for (let i = 0; i < this.digits.length; i++) {
            if (this.digits[i] !== other.digits[i]) {
                return this.digits[i] > other.digits[i] ? 1 : -1;
            }
        }
        return 0;
    }

    comparedTo(other) {
        if (this.sign !== other.sign) {
            return this.sign > other.sign ? 1 : -1;
        }
        const absoluteComparison = this._compareAbsolute(other);
        return this.sign * absoluteComparison;
    }

    plus(other) {
        if (this.sign === other.sign) {
            const resultDigits = [];
            let carry = 0;
            let i = this.digits.length - 1;
            let j = other.digits.length - 1;

            while (i >= 0 || j >= 0 || carry > 0) {
                const sum = (i >= 0 ? this.digits[i--] : 0) + (j >= 0 ? other.digits[j--] : 0) + carry;
                resultDigits.unshift(sum % 10);
                carry = Math.floor(sum / 10);
            }
            const result = new ArbitraryPrecisionNumber(0);
            result.digits = resultDigits;
            result.sign = this.sign;
            result._trimLeadingZeros();
            return result;
        } else {
            const absThis = new ArbitraryPrecisionNumber(this);
            absThis.sign = 1;
            const absOther = new ArbitraryPrecisionNumber(other);
            absOther.sign = 1;

            const absComparison = absThis._compareAbsolute(absOther);

            if (absComparison === 0) return new ArbitraryPrecisionNumber(0);

            if (absComparison === 1) {
                const result = absThis._subtractPositive(absOther);
                result.sign = this.sign;
                return result;
            } else {
                const result = absOther._subtractPositive(absThis);
                result.sign = other.sign;
                return result;
            }
        }
    }

    _subtractPositive(other) {
        const resultDigits = [];
        let borrow = 0;
        let i = this.digits.length - 1;
        let j = other.digits.length - 1;

        while (i >= 0) {
            let digitThis = this.digits[i--];
            let digitOther = j >= 0 ? other.digits[j--] : 0;
            let diff = digitThis - digitOther - borrow;

            if (diff < 0) {
                diff += 10;
                borrow = 1;
            } else {
                borrow = 0;
            }
            resultDigits.unshift(diff);
        }
        const result = new ArbitraryPrecisionNumber(0);
        result.digits = resultDigits;
        result.sign = 1;
        result._trimLeadingZeros();
        return result;
    }

    times(other) {
        if ((this.digits.length === 1 && this.digits[0] === 0) ||
            (other.digits.length === 1 && other.digits[0] === 0)) {
            return new ArbitraryPrecisionNumber(0);
        }

        const productDigits = Array(this.digits.length + other.digits.length).fill(0);
        const resultSign = this.sign * other.sign;

        for (let i = this.digits.length - 1; i >= 0; i--) {
            let carry = 0;
            for (let j = other.digits.length - 1; j >= 0; j--) {
                const product = this.digits[i] * other.digits[j] + productDigits[i + j + 1] + carry;
                productDigits[i + j + 1] = product % 10;
                carry = Math.floor(product / 10);
            }
            productDigits[i] += carry;
        }

        const result = new ArbitraryPrecisionNumber(0);
        result.digits = productDigits;
        result.sign = resultSign;
        result._trimLeadingZeros();
        return result;
    }
}

const calculateTotalCost = (inputLines) => {
    const [firstInputLine, secondInputLine] = inputLines;
    const [pointCount, costPerUnitDifference, maximumCostPerUnitDifference] = firstInputLine.split(" ").map(Number);
    const dataPointValues = secondInputLine.split(" ").map(Number);

    const initialAccumulatedValue = new ArbitraryPrecisionNumber(0);

    const finalAccumulatedValue = dataPointValues.slice(0, pointCount - 1).reduce((currentSum, currentDataPoint, index) => {
        const nextDataPoint = dataPointValues[index + 1];
        const valueChange = nextDataPoint - currentDataPoint;

        const computedChangeCost = new ArbitraryPrecisionNumber(costPerUnitDifference).times(new ArbitraryPrecisionNumber(valueChange));

        if (computedChangeCost.comparedTo(new ArbitraryPrecisionNumber(maximumCostPerUnitDifference)) === 1) {
            return currentSum.plus(new ArbitraryPrecisionNumber(maximumCostPerUnitDifference));
        } else {
            return currentSum.plus(computedChangeCost);
        }
    }, initialAccumulatedValue);

    console.log(finalAccumulatedValue.toString());
};

calculateTotalCost(fileSystem.readFileSync("/dev/stdin", "UTF-8").split("\n"));
