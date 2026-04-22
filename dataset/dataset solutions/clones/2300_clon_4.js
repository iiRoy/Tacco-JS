function processNumbers(inputString) {
    const startValue = Number(inputString.split("\n")[0]);

    class GrandNumber {
        constructor(val, isNeg = false) {
            this.chunks = [];
            this.negative = isNeg;

            if (typeof val === 'number') {
                if (val === 0) {
                    this.chunks = [0];
                    this.negative = false;
                } else {
                    let v = Math.abs(val);
                    while (v > 0) {
                        this.chunks.push(v % GrandNumber.segmentSize);
                        v = Math.floor(v / GrandNumber.segmentSize);
                    }
                    if (this.chunks.length === 0) this.chunks.push(0);
                    this.negative = val < 0;
                }
            } else if (typeof val === 'string') {
                const parsed = GrandNumber.fromString(val);
                this.chunks = parsed.chunks;
                this.negative = parsed.negative;
            } else if (Array.isArray(val)) {
                this.chunks = [...val];
                this.negative = isNeg;
            } else if (val instanceof GrandNumber) {
                this.chunks = [...val.chunks];
                this.negative = val.negative;
            } else if (val === null || val === undefined) {
                this.chunks = [0];
                this.negative = false;
            } else {
                throw new Error("Invalid type for GrandNumber creation");
            }
            this._normalize();
        }

        static segmentSize = 1 << 26;
        static zeroVal = new GrandNumber(0);
        static unitVal = new GrandNumber(1);
        static doubleVal = new GrandNumber(2);

        _normalize() {
            while (this.chunks.length > 1 && this.chunks[this.chunks.length - 1] === 0) {
                this.chunks.pop();
            }
            if (this.chunks.length === 1 && this.chunks[0] === 0) {
                this.negative = false;
            }
        }

        _compareAbsolute(other) {
            this._normalize();
            other._normalize();
            if (this.chunks.length !== other.chunks.length) {
                return this.chunks.length > other.chunks.length ? 1 : -1;
            }
            for (let i = this.chunks.length - 1; i >= 0; i--) {
                if (this.chunks[i] !== other.chunks[i]) {
                    return this.chunks[i] > other.chunks[i] ? 1 : -1;
                }
            }
            return 0;
        }

        compare(other) {
            other = GrandNumber.fromInput(other);
            if (this.negative !== other.negative) {
                return this.negative ? -1 : 1;
            }
            const absComparison = this._compareAbsolute(other);
            return this.negative ? -absComparison : absComparison;
        }

        isZero() { return this.chunks.length === 1 && this.chunks[0] === 0; }
        isUnit() { return !this.negative && this.chunks.length === 1 && this.chunks[0] === 1; }
        isEven() { return this.chunks[0] % 2 === 0; }
        isOdd() { return this.chunks[0] % 2 !== 0; }
        isNegative() { return this.negative && !this.isZero(); }

        toAbsolute() {
            const result = new GrandNumber(this.chunks, false);
            result._normalize();
            return result;
        }

        add(other) {
            other = GrandNumber.fromInput(other);
            if (this.negative !== other.negative) {
                const absThis = this.toAbsolute();
                const absOther = other.toAbsolute();
                const absComparison = absThis._compareAbsolute(absOther);

                if (absComparison === 0) return GrandNumber.zeroVal;

                let result;
                if (absComparison > 0) {
                    result = absThis.subtract(absOther);
                    result.negative = this.negative;
                } else {
                    result = absOther.subtract(absThis);
                    result.negative = other.negative;
                }
                result._normalize();
                return result;
            }

            const maxLength = Math.max(this.chunks.length, other.chunks.length);
            const sumChunks = new Array(maxLength);
            let carry = 0;
            for (let i = 0; i < maxLength; i++) {
                const digit1 = this.chunks[i] || 0;
                const digit2 = other.chunks[i] || 0;
                const currentSum = digit1 + digit2 + carry;
                sumChunks[i] = currentSum % GrandNumber.segmentSize;
                carry = Math.floor(currentSum / GrandNumber.segmentSize);
            }
            if (carry > 0) {
                sumChunks.push(carry);
            }
            const result = new GrandNumber(sumChunks, this.negative);
            result._normalize();
            return result;
        }

        subtract(other) {
            other = GrandNumber.fromInput(other);
            if (this.negative !== other.negative) {
                const absThis = this.toAbsolute();
                const absOther = other.toAbsolute();
                const result = absThis.add(absOther);
                result.negative = this.negative;
                result._normalize();
                return result;
            }

            const absThis = this.toAbsolute();
            const absOther = other.toAbsolute();
            const absComparison = absThis._compareAbsolute(absOther);

            if (absComparison === 0) return GrandNumber.zeroVal;

            let result;
            if (absComparison > 0) {
                result = absThis._subtractRaw(absOther);
                result.negative = this.negative;
            } else {
                result = absOther._subtractRaw(absThis);
                result.negative = !other.negative;
            }
            result._normalize();
            return result;
        }

        _subtractRaw(other) { // Assumes this >= other and both are non-negative
            const maxLength = Math.max(this.chunks.length, other.chunks.length);
            const diffChunks = new Array(maxLength);
            let borrow = 0;
            for (let i = 0; i < maxLength; i++) {
                const digit1 = this.chunks[i] || 0;
                const digit2 = other.chunks[i] || 0;
                let currentDiff = digit1 - digit2 - borrow;
                if (currentDiff < 0) {
                    currentDiff += GrandNumber.segmentSize;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                diffChunks[i] = currentDiff;
            }
            const result = new GrandNumber(diffChunks, false);
            result._normalize();
            return result;
        }

        _multiplyByDigit(digit) {
            if (digit === 0) return GrandNumber.zeroVal;
            if (digit === 1) return this;

            const productChunks = new Array(this.chunks.length);
            let carry = 0;
            for (let i = 0; i < this.chunks.length; i++) {
                const currentProduct = this.chunks[i] * digit + carry;
                productChunks[i] = currentProduct % GrandNumber.segmentSize;
                carry = Math.floor(currentProduct / GrandNumber.segmentSize);
            }
            if (carry > 0) {
                productChunks.push(carry);
            }
            const result = new GrandNumber(productChunks, this.negative);
            result._normalize();
            return result;
        }

        multiply(other) {
            other = GrandNumber.fromInput(other);
            if (this.isZero() || other.isZero()) return GrandNumber.zeroVal;

            const resultSign = this.negative !== other.negative;
            const absThis = this.toAbsolute();
            const absOther = other.toAbsolute();

            const productChunks = new Array(absThis.chunks.length + absOther.chunks.length).fill(0);

            for (let i = 0; i < absThis.chunks.length; i++) {
                let carry = 0;
                for (let j = 0; j < absOther.chunks.length; j++) {
                    const currentProduct = absThis.chunks[i] * absOther.chunks[j] + productChunks[i + j] + carry;
                    productChunks[i + j] = currentProduct % GrandNumber.segmentSize;
                    carry = Math.floor(currentProduct / GrandNumber.segmentSize);
                }
                if (carry > 0) {
                    productChunks[i + absOther.chunks.length] += carry;
                }
            }

            const result = new GrandNumber(productChunks, resultSign);
            result._normalize();
            return result;
        }

        divideAndMod(other) {
            other = GrandNumber.fromInput(other);
            if (other.isZero()) throw new Error("Division by zero");
            if (this.isZero()) return { quotient: GrandNumber.zeroVal, remainder: GrandNumber.zeroVal };

            const resultSign = this.negative !== other.negative;
            const remainderSign = this.negative;

            const absThis = this.toAbsolute();
            const absOther = other.toAbsolute();

            if (absThis._compareAbsolute(absOther) < 0) {
                return { quotient: GrandNumber.zeroVal, remainder: this };
            }
            if (absOther.isUnit()) {
                const q = new GrandNumber(absThis.chunks, resultSign);
                q._normalize();
                return { quotient: q, remainder: GrandNumber.zeroVal };
            }

            let quotientChunks = [];
            let currentRemainder = GrandNumber.zeroVal;

            for (let i = absThis.chunks.length - 1; i >= 0; i--) {
                currentRemainder = currentRemainder.multiply(GrandNumber.segmentSize).add(absThis.chunks[i]);
                let qDigit = 0;
                if (currentRemainder._compareAbsolute(absOther) >= 0) {
                    let low = 0;
                    let high = GrandNumber.segmentSize - 1;
                    let mid;
                    let testProduct;

                    while (low <= high) {
                        mid = Math.floor((low + high) / 2);
                        testProduct = absOther._multiplyByDigit(mid);
                        if (testProduct._compareAbsolute(currentRemainder) <= 0) {
                            qDigit = mid;
                            low = mid + 1;
                        } else {
                            high = mid - 1;
                        }
                    }
                    currentRemainder = currentRemainder.subtract(absOther._multiplyByDigit(qDigit));
                }
                quotientChunks.unshift(qDigit);
            }

            const quotient = new GrandNumber(quotientChunks, resultSign);
            quotient._normalize();

            let remainder = new GrandNumber(currentRemainder.chunks, remainderSign);
            remainder._normalize();

            if (this.negative && !remainder.isZero()) {
                remainder = remainder.negate();
            }

            return { quotient, remainder };
        }

        divide(other) { return this.divideAndMod(other).quotient; }
        modulo(other) { return this.divideAndMod(other).remainder; }

        negate() {
            if (this.isZero()) return GrandNumber.zeroVal;
            const result = new GrandNumber(this.chunks, !this.negative);
            result._normalize();
            return result;
        }

        powerModulo(exponent, modulus) {
            exponent = GrandNumber.fromInput(exponent);
            modulus = GrandNumber.fromInput(modulus);

            if (modulus.isZero()) throw new Error("modulus cannot be zero");
            if (exponent.isNegative()) throw new Error("negative exponent not supported for powerModulo");
            if (modulus.isUnit()) return GrandNumber.zeroVal;
            if (exponent.isZero()) return GrandNumber.unitVal.modulo(modulus);

            let base = this.modulo(modulus);
            let result = GrandNumber.unitVal;

            let exp = exponent;
            while (!exp.isZero()) {
                if (exp.isOdd()) {
                    result = result.multiply(base).modulo(modulus);
                }
                base = base.multiply(base).modulo(modulus);
                exp = exp.divide(GrandNumber.doubleVal);
            }
            return result;
        }

        toString() {
            if (this.isZero()) return "0";
            let s = "";
            let current = this.toAbsolute();
            const decimalTen = new GrandNumber(10);
            while (!current.isZero()) {
                const { quotient, remainder } = current.divideAndMod(decimalTen);
                s = remainder.chunks[0] + s;
                current = quotient;
            }
            return this.negative ? "-" + s : s;
        }

        static fromString(str) {
            str = String(str).trim();
            const isNeg = str.startsWith('-');
            if (isNeg) str = str.substring(1);
            if (str === "0") return GrandNumber.zeroVal;
            if (!/^\d+$/.test(str)) {
                throw new Error("Invalid number string: " + str);
            }

            let current = GrandNumber.zeroVal;
            const decimalTen = GrandNumber.fromInput(10);
            for (let i = 0; i < str.length; i++) {
                current = current.multiply(decimalTen).add(parseInt(str[i], 10));
            }
            current.negative = isNeg;
            current._normalize();
            return current;
        }

        static fromInput(val) {
            if (val instanceof GrandNumber) return val;
            if (typeof val === 'number') return new GrandNumber(val);
            if (typeof val === 'string') return GrandNumber.fromString(val);
            throw new Error("Cannot convert value to GrandNumber: " + val);
        }

        increase() {
            return this.add(GrandNumber.unitVal);
        }

        isTrulyPrime(iterations = 5) {
            if (this.isZero() || this.isUnit()) return false;
            if (this.compare(GrandNumber.doubleVal) === 0 || this.compare(GrandNumber.fromInput("3")) === 0) return true;
            if (this.isEven()) return false;

            let d = this.subtract(GrandNumber.unitVal);
            let s = 0;
            while (d.isEven()) {
                d = d.divide(GrandNumber.doubleVal);
                s++;
            }

            const selfMinusOne = this.subtract(GrandNumber.unitVal);

            const testWitnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

            for (let i = 0; i < Math.min(iterations, testWitnesses.length); i++) {
                const a = GrandNumber.fromInput(testWitnesses[i]);
                if (a.compare(selfMinusOne) >= 0) continue;

                let x = a.powerModulo(d, this);
                if (x.isUnit() || x.compare(selfMinusOne) === 0) continue;

                let isComposite = true;
                for (let r = 0; r < s; r++) {
                    x = x.multiply(x).modulo(this);
                    if (x.isUnit()) return false;
                    if (x.compare(selfMinusOne) === 0) {
                        isComposite = false;
                        break;
                    }
                }
                if (isComposite) return false;
            }
            return true;
        }
    }

    let currentCandidate = new GrandNumber(startValue);
    const maximumRange = new GrandNumber("100000000000000");
    const upperLimit = currentCandidate.add(maximumRange);

    while (currentCandidate.compare(upperLimit) < 0) {
        if (currentCandidate.isTrulyPrime()) {
            console.log(currentCandidate.toString());
            break;
        }
        currentCandidate = currentCandidate.increase();
    }
}

processNumbers(require('fs').readFileSync('/dev/stdin', 'utf8'));