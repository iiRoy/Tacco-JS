"use strict";
const DataStreamProcessor = (function() {
    function LineNavigator(rawDataContent) {
        let textLines = rawDataContent.trim().split('\n');
        let currentLineIndex = 0;
        let currentLineParts = [];

        const prepareLineParts = () => {
            if (currentLineParts.length === 0 && currentLineIndex < textLines.length) {
                currentLineParts = textLines[currentLineIndex].split(' ');
            }
        };

        const advanceLineIfEmpty = () => {
            if (currentLineParts.length === 0) {
                currentLineIndex++;
                currentLineParts = [];
            }
        };

        this.grabNext = (returnAsString) => {
            prepareLineParts();
            if (currentLineParts.length === 0) return undefined;

            let extractedValue = currentLineParts.shift();
            advanceLineIfEmpty();
            return returnAsString ? extractedValue : Number(extractedValue);
        };

        this.pullLine = (returnAsStrings) => {
            if (currentLineIndex >= textLines.length) return undefined;
            let lineContent = textLines[currentLineIndex++];
            currentLineParts = [];
            let parts = lineContent.split(' ');
            return returnAsStrings ? parts : parts.map(Number);
        };

        this.extractBlock = (numberOfLines, returnAsStrings) => {
            if (currentLineIndex + numberOfLines > textLines.length) return undefined;
            let blockData = textLines.slice(currentLineIndex, currentLineIndex + numberOfLines);
            currentLineIndex += numberOfLines;
            currentLineParts = [];
            return returnAsStrings ? blockData.map(l => l.split(' ')) : blockData.map(l => l.split(' ').map(Number));
        };

        this.retrieveRows = (numberOfRows, returnAsStrings) => {
            if (currentLineIndex + numberOfRows > textLines.length) return undefined;
            let rowsContent = textLines.slice(currentLineIndex, currentLineIndex + numberOfRows);
            currentLineIndex += numberOfRows;
            currentLineParts = [];
            return returnAsStrings ? rowsContent : rowsContent.map(Number);
        };
    }

    return function(sourceString) {
        return new LineNavigator(sourceString);
    };
})();

const dataAcquirer = DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const NumericProcessor = (function() {
    class LargeNum {
        constructor(value) {
            if (value instanceof LargeNum) {
                this._digits = value._digits;
                this._isNegative = value._isNegative;
                return;
            }
            let s = String(value);
            this._isNegative = false;
            if (s.startsWith('-')) {
                this._isNegative = true;
                s = s.substring(1);
            }
            this._digits = s.replace(/^0+/, '') || '0';
            if (this._digits === '0') {
                this._isNegative = false;
            }
        }

        static from(val) {
            return new LargeNum(val);
        }

        get value() {
            return (this._isNegative ? '-' : '') + this._digits;
        }

        isZero() { return this._digits === '0'; }
        isPositive() { return !this._isNegative && !this.isZero(); }
        isNegative() { return this._isNegative; }

        equals(other) {
            other = LargeNum.from(other);
            return this.isNegative() === other.isNegative() && this._digits === other._digits;
        }

        compare(other) {
            other = LargeNum.from(other);
            if (this.equals(other)) return 0;

            if (this.isNegative() && !other.isNegative()) return -1;
            if (!this.isNegative() && other.isNegative()) return 1;

            const absStringCompare = (sA, sB) => {
                if (sA.length !== sB.length) {
                    return sA.length > sB.length ? 1 : -1;
                }
                for (let i = 0; i < sA.length; i++) {
                    if (sA[i] !== sB[i]) {
                        return parseInt(sA[i]) > parseInt(sB[i]) ? 1 : -1;
                    }
                }
                return 0;
            };

            const absComparisonResult = absStringCompare(this._digits, other._digits);
            return this.isNegative() ? -absComparisonResult : absComparisonResult;
        }

        abs() {
            return new LargeNum(this._digits);
        }

        negate() {
            if (this.isZero()) return LargeNum.zero;
            const res = new LargeNum(this);
            res._isNegative = !res._isNegative;
            return res;
        }

        static _addStringDigits(s1, s2) {
            let res = '';
            let carry = 0;
            let i = s1.length - 1;
            let j = s2.length - 1;

            while (i >= 0 || j >= 0 || carry > 0) {
                let d1 = i >= 0 ? parseInt(s1[i--]) : 0;
                let d2 = j >= 0 ? parseInt(s2[j--]) : 0;
                let sum = d1 + d2 + carry;
                res = (sum % 10) + res;
                carry = Math.floor(sum / 10);
            }
            return res;
        }

        static _subtractStringDigits(s1, s2) {
            let res = '';
            let borrow = 0;
            let i = s1.length - 1;
            let j = s2.length - 1;

            while (i >= 0 || j >= 0) {
                let d1 = i >= 0 ? parseInt(s1[i--]) : 0;
                let d2 = j >= 0 ? parseInt(s2[j--]) : 0;
                let diff = d1 - d2 - borrow;
                if (diff < 0) {
                    diff += 10;
                    borrow = 1;
                } else {
                    borrow = 0;
                }
                res = diff + res;
            }
            return res.replace(/^0+/, '') || '0';
        }

        sum(other) {
            other = LargeNum.from(other);
            if (this.isZero()) return other;
            if (other.isZero()) return this;

            if (this.isNegative() === other.isNegative()) {
                const digits = LargeNum._addStringDigits(this._digits, other._digits);
                const result = new LargeNum(digits);
                result._isNegative = this.isNegative();
                return result;
            } else {
                const absThis = this.abs();
                const absOther = other.abs();
                if (absThis.equals(absOther)) return LargeNum.zero;

                let result;
                if (absThis.compare(absOther) > 0) {
                    result = new LargeNum(LargeNum._subtractStringDigits(absThis._digits, absOther._digits));
                    result._isNegative = this.isNegative();
                } else {
                    result = new LargeNum(LargeNum._subtractStringDigits(absOther._digits, absThis._digits));
                    result._isNegative = other.isNegative();
                }
                return result;
            }
        }

        subtract(other) {
            other = LargeNum.from(other);
            return this.sum(other.negate());
        }

        static _multiplySingleDigitString(s, digit) {
            if (digit === 0) return '0';
            let res = '';
            let carry = 0;
            for (let i = s.length - 1; i >= 0; i--) {
                let prod = parseInt(s[i]) * digit + carry;
                res = (prod % 10) + res;
                carry = Math.floor(prod / 10);
            }
            return (carry > 0 ? carry : '') + res;
        }

        static _multiplyStringDigits(s1, s2) {
            if (s1 === '0' || s2 === '0') return '0';

            let result = '0';
            for (let i = s2.length - 1; i >= 0; i--) {
                let digit2 = parseInt(s2[i]);
                let temp = LargeNum._multiplySingleDigitString(s1, digit2);
                temp += '0'.repeat(s2.length - 1 - i);
                result = LargeNum._addStringDigits(result, temp);
            }
            return result;
        }

        product(other) {
            other = LargeNum.from(other);
            if (this.isZero() || other.isZero()) return LargeNum.zero;

            const digits = LargeNum._multiplyStringDigits(this._digits, other._digits);
            const result = new LargeNum(digits);
            result._isNegative = this.isNegative() !== other.isNegative();
            return result;
        }

        static _divmodStringDigits(dividendStr, divisorStr) {
            if (divisorStr === '0') throw new Error("Division by zero");
            if (dividendStr === '0') return { quotient: '0', remainder: '0' };

            const sCompare = (sA, sB) => {
                if (sA.length !== sB.length) return sA.length > sB.length ? 1 : -1;
                for (let i = 0; i < sA.length; i++) {
                    if (sA[i] !== sB[i]) return parseInt(sA[i]) > parseInt(sB[i]) ? 1 : -1;
                }
                return 0;
            };

            if (sCompare(dividendStr, divisorStr) < 0) {
                return { quotient: '0', remainder: dividendStr };
            }
            if (sCompare(dividendStr, divisorStr) === 0) {
                return { quotient: '1', remainder: '0' };
            }

            let quotient = '';
            let current = '';
            for (let i = 0; i < dividendStr.length; i++) {
                current += dividendStr[i];
                let count = 0;
                while (sCompare(current, divisorStr) >= 0) {
                    current = LargeNum._subtractStringDigits(current, divisorStr);
                    count++;
                }
                quotient += count;
            }
            return {
                quotient: quotient.replace(/^0+/, '') || '0',
                remainder: current.replace(/^0+/, '') || '0'
            };
        }

        division(other) {
            other = LargeNum.from(other);
            if (other.isZero()) throw new Error("Division by zero");
            if (this.isZero()) return LargeNum.zero;

            const { quotient } = LargeNum._divmodStringDigits(this.abs()._digits, other.abs()._digits);
            const result = new LargeNum(quotient);
            result._isNegative = this.isNegative() !== other.isNegative();
            return result;
        }

        remainder(divisor) {
            divisor = LargeNum.from(divisor);
            if (divisor.isZero()) throw new Error("Remainder by zero");
            if (this.isZero()) return LargeNum.zero;

            const { remainder } = LargeNum._divmodStringDigits(this.abs()._digits, divisor.abs()._digits);
            let result = new LargeNum(remainder);
            if (this.isNegative() && !result.isZero()) {
                result._isNegative = true;
            }
            return result;
        }

        modulo(modulus) {
            modulus = LargeNum.from(modulus);
            if (modulus.isZero()) throw new Error("Modulo by zero");

            let rem = this.remainder(modulus);
            if (rem.isNegative() && modulus.isPositive()) {
                rem = rem.sum(modulus);
            } else if (!rem.isNegative() && modulus.isNegative()) {
                rem = rem.sum(modulus);
            }
            return rem;
        }

        modInverse(m) {
            m = LargeNum.from(m);
            if (m.isZero()) throw new Error("Modulus cannot be zero for modular inverse.");

            let a = new LargeNum(this);
            let n = new LargeNum(m);

            if (a.isNegative()) a = a.modulo(n).sum(n);
            a = a.modulo(n);

            let t = LargeNum.zero;
            let newT = LargeNum.one;
            let r = n;
            let newR = a;

            while (!newR.isZero()) {
                let quotient = r.division(newR);
                let lastT = t;
                let lastR = r;

                t = newT;
                r = newR;
                newT = lastT.subtract(quotient.product(newT));
                newR = lastR.subtract(quotient.product(newR));
            }

            if (!r.equals(LargeNum.one)) {
                throw new Error("Modular inverse does not exist (numbers are not coprime).");
            }
            if (t.compare(LargeNum.zero) === -1) {
                t = t.sum(n);
            }
            return t;
        }

        static _gcd(a, b) {
            a = LargeNum.from(a).abs();
            b = LargeNum.from(b).abs();
            while (!b.isZero()) {
                let temp = b;
                b = a.modulo(b);
                a = temp;
            }
            return a;
        }

        static leastCommonMultiple(a, b) {
            a = LargeNum.from(a).abs();
            b = LargeNum.from(b).abs();
            if (a.isZero() || b.isZero()) return LargeNum.zero;
            return a.division(LargeNum._gcd(a, b)).product(b);
        }
    }

    LargeNum.zero = new LargeNum('0');
    LargeNum.one = new LargeNum('1');

    return LargeNum;
})();

const NumLib = NumericProcessor;
const moduloConstant = 1000000007;

const calculateFinalValue = () => {
    const elementCount = dataAcquirer.grabNext();
    const inputNumbers = dataAcquirer.pullLine();

    const currentLcmVal = inputNumbers.slice(1).reduce((accumulator, currentElement) => {
        return NumLib.leastCommonMultiple(accumulator, currentElement);
    }, NumLib.from(inputNumbers[0]));

    const adjustedLcm = currentLcmVal.modulo(moduloConstant);

    const totalSum = inputNumbers.reduce((accumulator, currentElement) => {
        const numInstance = NumLib.from(currentElement);
        const inverse = numInstance.modInverse(moduloConstant);
        return accumulator.sum(inverse);
    }, NumLib.zero);

    const finalResult = totalSum.product(adjustedLcm).modulo(moduloConstant);
    return Number(finalResult.value);
};

const processedOutput = calculateFinalValue();
if (processedOutput !== undefined) {
    console.log(processedOutput);
}