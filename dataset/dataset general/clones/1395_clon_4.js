class ScalarMagnitude {
    #valueContainer;

    constructor(initialSource, inputFormat) {
        let processedContent;
        let effectiveFormat = inputFormat || 10;

        if (typeof initialSource === 'bigint') {
            processedContent = initialSource;
        } else if (initialSource instanceof ScalarMagnitude) {
            processedContent = initialSource.#valueContainer;
        } else if (typeof initialSource === 'number') {
            if (!Number.isFinite(initialSource)) {
                throw new Error('Non-finite numeric values are not supported.');
            }
            if (initialSource === 0) {
                processedContent = 0n;
            } else {
                const normalized = ScalarMagnitude.#normalizeParameter(initialSource, effectiveFormat);
                processedContent = ScalarMagnitude.#parseLiteral(normalized.num, normalized.base);
            }
        } else if (typeof initialSource === 'string') {
            const normalized = ScalarMagnitude.#normalizeParameter(initialSource, effectiveFormat);
            processedContent = ScalarMagnitude.#parseLiteral(normalized.num, normalized.base);
        } else {
            throw new TypeError('Invalid input type for ScalarMagnitude constructor.');
        }
        this.#valueContainer = processedContent;
    }

    static #parseLiteral(textRepresentation, baseIndicator) {
        if (baseIndicator < 2 || baseIndicator > 36) {
            throw new RangeError('Base indicator must be between 2 and 36.');
        }
        let resultantValue = 0n;
        let currentPower = 1n;
        const digitMapping = '0123456789abcdefghijklmnopqrstuvwxyz';
        const lowerText = textRepresentation.toLowerCase();

        let isNegative = false;
        let startIndex = 0;
        if (lowerText[0] === '-') {
            isNegative = true;
            startIndex = 1;
        }

        for (let i = lowerText.length - 1; i >= startIndex; i--) {
            const digit = digitMapping.indexOf(lowerText[i]);
            if (digit === -1 || digit >= baseIndicator) {
                throw new Error(`Invalid character '${lowerText[i]}' for base ${baseIndicator}`);
            }
            resultantValue += BigInt(digit) * currentPower;
            currentPower *= BigInt(baseIndicator);
        }
        return isNegative ? -resultantValue : resultantValue;
    }

    static #normalizeParameter(sourceInput, currentFormat) {
        let textVersion = typeof sourceInput === 'string' ? sourceInput : sourceInput.toString(currentFormat || 10);
        let base = currentFormat || 10;

        const positiveExponentPattern = /e\+/i;
        const negativeExponentPattern = /e\-/i;

        if (textVersion.match(positiveExponentPattern)) {
            const numAsStdNumber = Number(textVersion);
            if (!numAsStdNumber.toString().match(positiveExponentPattern)) {
                return {
                    num: Math.floor(numAsStdNumber).toString(),
                    base: 10
                };
            } else {
                const parts = textVersion.toLowerCase().split('e+');
                let mantissaString = parts[0];
                const exponentValue = BigInt(parts[1]);

                let decimalOffset = 0;
                if (mantissaString.includes('.')) {
                    const [integerPart, fractionalPart] = mantissaString.split('.');
                    mantissaString = integerPart + fractionalPart;
                    decimalOffset = fractionalPart.length;
                }

                const mantissaBigInt = ScalarMagnitude.#parseLiteral(mantissaString, 10);
                const ten = 10n;

                const effectiveExponent = exponentValue - BigInt(decimalOffset);

                if (effectiveExponent < 0n) {
                    return {
                        num: (mantissaBigInt / (ten ** -effectiveExponent)).toString(),
                        base: 10
                    };
                } else {
                    return {
                        num: (mantissaBigInt * (ten ** effectiveExponent)).toString(),
                        base: 10
                    };
                }
            }
        } else if (textVersion.match(negativeExponentPattern)) {
            return {
                num: Math.floor(Number(textVersion)).toString(),
                base: base
            };
        } else {
            return {
                num: textVersion,
                base: base
            };
        }
    }

    static #extractBigIntValue(valueSource) {
        if (typeof valueSource === 'bigint') {
            return valueSource;
        }
        if (valueSource instanceof ScalarMagnitude) {
            return valueSource.#valueContainer;
        }
        if (typeof valueSource === 'number') {
            return BigInt(Math.floor(valueSource));
        }
        if (typeof valueSource === 'string') {
            const normalized = ScalarMagnitude.#normalizeParameter(valueSource, 10);
            return ScalarMagnitude.#parseLiteral(normalized.num, normalized.base);
        }
        throw new TypeError('Unsupported type for numeric operation.');
    }

    examineRepresentation() {
        return `<ScalarMagnitude ${this.renderValue(10)}>`;
    }

    renderValue(outputBase) {
        const base = outputBase || 10;
        if (base < 2 || base > 36) {
            throw new RangeError('Output base must be between 2 and 36.');
        }
        let output = this.#valueContainer.toString(base);
        if (base > 10 && typeof output === 'string') {
            output = output.toLowerCase();
        }
        return output;
    }

    extractNumber() {
        return Number(this.#valueContainer);
    }

    augment(otherOperand) {
        return new ScalarMagnitude(this.#valueContainer + ScalarMagnitude.#extractBigIntValue(otherOperand));
    }

    diminish(otherOperand) {
        return new ScalarMagnitude(this.#valueContainer - ScalarMagnitude.#extractBigIntValue(otherOperand));
    }

    amplify(otherOperand) {
        return new ScalarMagnitude(this.#valueContainer * ScalarMagnitude.#extractBigIntValue(otherOperand));
    }

    partition(otherOperand) {
        const divisor = ScalarMagnitude.#extractBigIntValue(otherOperand);
        if (divisor === 0n) throw new Error('Division by zero is undefined.');
        return new ScalarMagnitude(this.#valueContainer / divisor);
    }

    remainderOf(otherOperand) {
        const divisor = ScalarMagnitude.#extractBigIntValue(otherOperand);
        if (divisor === 0n) throw new Error('Modulo by zero is undefined.');
        return new ScalarMagnitude(this.#valueContainer % divisor);
    }

    absoluteForm() {
        return new ScalarMagnitude(this.#valueContainer < 0n ? -this.#valueContainer : this.#valueContainer);
    }

    oppositeSign() {
        return new ScalarMagnitude(-this.#valueContainer);
    }

    modularPower(exponentOperand, modulusOperand) {
        const expBig = ScalarMagnitude.#extractBigIntValue(exponentOperand);
        const modBig = ScalarMagnitude.#extractBigIntValue(modulusOperand);

        if (modBig === 0n) throw new Error('Modular exponentiation by zero modulus.');
        if (modBig === 1n || modBig === -1n) return new ScalarMagnitude(0n);

        let base = this.#valueContainer;
        let exponent = expBig;
        let modulus = modBig;

        base = (base % modulus + modulus) % modulus;

        if (exponent < 0n) {
            const invertedBase = this.modularInverse(modulus);
            return invertedBase.modularPower(-exponent, modulus);
        }

        let result = 1n;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            base = (base * base) % modulus;
            exponent /= 2n;
        }
        return new ScalarMagnitude(result);
    }

    modularInverse(modulusOperand) {
        let a = this.#valueContainer;
        let m = ScalarMagnitude.#extractBigIntValue(modulusOperand);

        if (m === 0n) throw new Error('Modular inverse by zero modulus.');
        if (m === 1n) return new ScalarMagnitude(0n);

        a = (a % m + m) % m;

        let m0 = m;
        let y = 0n, x = 1n;

        while (a > 1n) {
            let quotient = a / m0;
            let temp = m0;

            m0 = a % m0;
            a = temp;
            temp = y;

            y = x - quotient * y;
            x = temp;
        }

        if (x < 0n) {
            x = x + m;
        }
        return new ScalarMagnitude(x);
    }

    exponentiate(exponentOperand) {
        const expBig = ScalarMagnitude.#extractBigIntValue(exponentOperand);

        if (expBig < 0n) {
            return this.modularPower(expBig, this.#valueContainer);
        }
        return new ScalarMagnitude(this.#valueContainer ** expBig);
    }

    bitShiftLeft(shiftAmount) {
        const shiftBig = ScalarMagnitude.#extractBigIntValue(shiftAmount);
        if (shiftBig < 0n) {
            return this.bitShiftRight(-shiftBig);
        }
        return new ScalarMagnitude(this.#valueContainer << shiftBig);
    }

    bitShiftRight(shiftAmount) {
        const shiftBig = ScalarMagnitude.#extractBigIntValue(shiftAmount);
        if (shiftBig < 0n) {
            return this.bitShiftLeft(-shiftBig);
        }
        return new ScalarMagnitude(this.#valueContainer >> shiftBig);
    }

    evaluateComparison(otherOperand) {
        const otherVal = ScalarMagnitude.#extractBigIntValue(otherOperand);
        if (this.#valueContainer > otherVal) return 1;
        if (this.#valueContainer < otherVal) return -1;
        return 0;
    }

    isGreater(otherOperand) { return this.evaluateComparison(otherOperand) > 0; }
    isGreaterEqual(otherOperand) { return this.evaluateComparison(otherOperand) >= 0; }
    isEqual(otherOperand) { return this.evaluateComparison(otherOperand) === 0; }
    isNotEqual(otherOperand) { return this.evaluateComparison(otherOperand) !== 0; }
    isLesser(otherOperand) { return this.evaluateComparison(otherOperand) < 0; }
    isLesserEqual(otherOperand) { return this.evaluateComparison(otherOperand) <= 0; }

    bitwiseAnd(otherOperand) { return new ScalarMagnitude(this.#valueContainer & ScalarMagnitude.#extractBigIntValue(otherOperand)); }
    bitwiseOr(otherOperand) { return new ScalarMagnitude(this.#valueContainer | ScalarMagnitude.#extractBigIntValue(otherOperand)); }
    bitwiseXor(otherOperand) { return new ScalarMagnitude(this.#valueContainer ^ ScalarMagnitude.#extractBigIntValue(otherOperand)); }

    squareRoot() {
        if (this.#valueContainer < 0n) throw new Error('Square root of negative integers is not supported.');
        if (this.#valueContainer === 0n) return new ScalarMagnitude(0n);
        if (this.#valueContainer === 1n) return new ScalarMagnitude(1n);

        let rootEstimate = this.#valueContainer;
        let nextEstimate = (rootEstimate + 1n) / 2n;

        while (nextEstimate < rootEstimate) {
            rootEstimate = nextEstimate;
            nextEstimate = (rootEstimate + this.#valueContainer / rootEstimate) / 2n;
        }
        return new ScalarMagnitude(rootEstimate);
    }

    nthRoot(rootIndex) {
        const N = ScalarMagnitude.#extractBigIntValue(rootIndex);
        if (N <= 0n) throw new Error('Nth root requires a positive integer N.');
        if (this.#valueContainer < 0n) {
            if (N % 2n === 0n) throw new Error('Even root of negative integers is not supported.');
            return new ScalarMagnitude(-this.absoluteForm().nthRoot(N).#valueContainer);
        }
        if (this.#valueContainer === 0n) return new ScalarMagnitude(0n);
        if (this.#valueContainer === 1n) return new ScalarMagnitude(1n);

        let lowerBound = 1n;
        let upperBound = this.#valueContainer;
        let currentRoot = 1n;

        while (lowerBound <= upperBound) {
            let midValue = lowerBound + (upperBound - lowerBound) / 2n;
            let testPower = midValue ** N;
            if (testPower === this.#valueContainer) {
                currentRoot = midValue;
                break;
            } else if (testPower < this.#valueContainer) {
                currentRoot = midValue;
                lowerBound = midValue + 1n;
            } else {
                upperBound = midValue - 1n;
            }
        }
        return new ScalarMagnitude(currentRoot);
    }

    randomWithinRange(upperLimit) {
        if (upperLimit === undefined) {
            if (this.#valueContainer === 1n) {
                return new ScalarMagnitude(0n);
            }
            return ScalarMagnitude.#generateSecureRandom(this.#valueContainer - 1n);
        } else {
            const highVal = ScalarMagnitude.#extractBigIntValue(upperLimit);
            const range = highVal - this.#valueContainer;
            if (range < 0n) throw new Error('Upper limit must be greater than or equal to current value.');
            return new ScalarMagnitude(ScalarMagnitude.#generateSecureRandom(range) + this.#valueContainer);
        }
    }

    static #generateSecureRandom(maximumValue) {
        if (maximumValue < 0n) throw new Error('Maximum value for random generation must be non-negative.');
        if (maximumValue === 0n) return 0n;

        const bitLength = maximumValue.toString(2).length;
        const byteLength = Math.ceil(bitLength / 8);

        let randomBytes = new Uint8Array(byteLength);
        let randomBigInt;

        do {
            crypto.getRandomValues(randomBytes);
            randomBigInt = BigInt('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
        } while (randomBigInt > maximumValue);

        return randomBigInt;
    }

    static generatePrime(bitSize, requiresSafe = true) {
        if (bitSize <= 0) throw new RangeError('Bit size must be positive.');
        if (bitSize > 4096) throw new Error('Generating very large primes can be extremely slow. Max bitSize: 4096');

        let primeCandidate;
        const minimumValue = 1n << BigInt(bitSize - 1);
        const maximumValue = (1n << BigInt(bitSize)) - 1n;

        while (true) {
            let randomData = new Uint8Array(Math.ceil(bitSize / 8));
            crypto.getRandomValues(randomData);
            primeCandidate = BigInt('0x' + Array.from(randomData).map(b => b.toString(16).padStart(2, '0')).join(''));

            const mask = (1n << BigInt(bitSize)) - 1n;
            primeCandidate &= mask;

            if (primeCandidate < minimumValue) primeCandidate |= minimumValue;
            if (primeCandidate % 2n === 0n) primeCandidate |= 1n;

            const entity = new ScalarMagnitude(primeCandidate);
            if (entity.testProbablePrime(20)) {
                if (requiresSafe) {
                    const sophieGermainCandidate = new ScalarMagnitude((primeCandidate - 1n) / 2n);
                    if (sophieGermainCandidate.testProbablePrime(20)) {
                        return entity;
                    }
                } else {
                    return entity;
                }
            }
        }
    }

    testProbablePrime(testIterations = 10) {
        const n = this.#valueContainer;
        if (n <= 1n) return false;
        if (n === 2n || n === 3n) return true;
        if (n % 2n === 0n) return false;

        let d = n - 1n;
        let s = 0n;
        while (d % 2n === 0n) {
            d /= 2n;
            s++;
        }

        witnessCheck: for (let r = 0; r < testIterations; r++) {
            const a = ScalarMagnitude.#generateSecureRandom(n - 4n) + 2n;
            let x = new ScalarMagnitude(a).modularPower(d, n).#valueContainer;

            if (x === 1n || x === n - 1n) continue witnessCheck;

            for (let i = 0n; i < s - 1n; i++) {
                x = (x * x) % n;
                if (x === n - 1n) continue witnessCheck;
            }
            return false;
        }
        return true;
    }

    findNextPrime() {
        let currentVal = this.#valueContainer;
        if (currentVal < 2n) currentVal = 2n;
        else if (currentVal % 2n === 0n) currentVal++;

        while (true) {
            const potentialPrime = new ScalarMagnitude(currentVal);
            if (potentialPrime.testProbablePrime()) {
                return potentialPrime;
            }
            currentVal += 2n;
        }
    }

    checkBitStatus(bitPosition) {
        const indexBig = BigInt(bitPosition);
        if (indexBig < 0n) throw new RangeError('Bit position must be non-negative.');
        return (this.#valueContainer >> indexBig) & 1n ? 1 : 0;
    }

    static fromByteSequence(byteBuffer, optionsConfig) {
        const config = optionsConfig || {};

        const byteArrangement = { 1: 'big', '-1': 'little' }[config.arrangementAlias]
            || config.byteOrder || 'big';

        let segmentUnitSize = config.segmentUnitSize === 'auto' ? Math.ceil(byteBuffer.length) : (config.segmentUnitSize || 1);

        if (byteBuffer.length % segmentUnitSize !== 0) {
            throw new RangeError('Byte sequence length (' + byteBuffer.length + ')'
                + ' must be a multiple of segment unit size (' + segmentUnitSize + ')'
            );
        }

        const hexSegments = [];
        for (let i = 0; i < byteBuffer.length; i += segmentUnitSize) {
            const currentChunk = [];
            for (let j = 0; j < segmentUnitSize; j++) {
                currentChunk.push(byteBuffer[
                    i + (byteArrangement === 'big' ? j : (segmentUnitSize - j - 1))
                ]);
            }

            hexSegments.push(currentChunk
                .map(byte => (byte < 16 ? '0' : '') + byte.toString(16))
                .join('')
            );
        }

        return new ScalarMagnitude(hexSegments.join(''), 16);
    }

    toByteSequence(optionsConfig) {
        if (typeof optionsConfig === 'string') {
            if (optionsConfig !== 'mpint') return 'Unsupported byte sequence representation';

            const positiveValue = this.absoluteForm();
            const absValueBytes = positiveValue.toByteSequence({ segmentUnitSize: 1, byteOrder: 'big' });

            let dataPayloadLength = absValueBytes.length === 1 && absValueBytes[0] === 0 ? 0 : absValueBytes.length;
            let needsLeadingZeroByte = false;
            if (dataPayloadLength > 0 && (absValueBytes[0] & 0x80)) {
                dataPayloadLength++;
                needsLeadingZeroByte = true;
            }

            const finalBufferBytes = new Uint8Array(4 + dataPayloadLength);

            if (absValueBytes.length > 0) {
                let destinationOffset = 4 + (needsLeadingZeroByte ? 1 : 0);
                for (let i = 0; i < absValueBytes.length; i++) {
                    finalBufferBytes[destinationOffset + i] = absValueBytes[i];
                }
            }
            if (needsLeadingZeroByte) {
                finalBufferBytes[4] = 0;
            }

            finalBufferBytes[0] = (dataPayloadLength >>> 24) & 0xFF;
            finalBufferBytes[1] = (dataPayloadLength >>> 16) & 0xFF;
            finalBufferBytes[2] = (dataPayloadLength >>> 8) & 0xFF;
            finalBufferBytes[3] = (dataPayloadLength >>> 0) & 0xFF;

            const isOriginalNegative = this.isLesser(0);
            if (isOriginalNegative) {
                for (let i = 4; i < finalBufferBytes.length; i++) {
                    finalBufferBytes[i] = 0xFF - finalBufferBytes[i];
                }
                let carry = 1;
                for (let i = finalBufferBytes.length - 1; i >= 4; i--) {
                    let sum = finalBufferBytes[i] + carry;
                    finalBufferBytes[i] = sum & 0xFF;
                    carry = sum >> 8;
                    if (carry === 0) break;
                }
            }
            if (finalBufferBytes.length > 4) {
                finalBufferBytes[4] = (finalBufferBytes[4] & 0x7F) | (isOriginalNegative ? 0x80 : 0);
            }

            return Buffer.from(finalBufferBytes);
        }

        const config = optionsConfig || {};

        const byteArrangement = { 1: 'big', '-1': 'little' }[config.arrangementAlias]
            || config.byteOrder || 'big';

        let hexRepresentation = this.renderValue(16);
        if (hexRepresentation.charAt(0) === '-') throw new Error(
            'Converting negative numbers to byte sequences not supported yet (except mpint format).'
        );

        let segmentUnitSize = config.segmentUnitSize === 'auto' ? Math.ceil(hexRepresentation.length / 2) : (config.segmentUnitSize || 1);

        const totalByteLength = Math.ceil(hexRepresentation.length / (2 * segmentUnitSize)) * segmentUnitSize;
        const targetHexLength = 2 * totalByteLength;

        while (hexRepresentation.length < targetHexLength) hexRepresentation = '0' + hexRepresentation;

        const hexChunks = hexRepresentation
            .split(new RegExp('(.{' + (2 * segmentUnitSize) + '})'))
            .filter(segment => segment.length > 0);

        const outputByteArray = new Uint8Array(totalByteLength);

        hexChunks.forEach((chunk, i) => {
            for (let j = 0; j < segmentUnitSize; j++) {
                const bufferIndex = i * segmentUnitSize + (byteArrangement === 'big' ? j : segmentUnitSize - j - 1);
                outputByteArray[bufferIndex] = parseInt(chunk.substring(j * 2, j * 2 + 2), 16);
            }
        });

        return Buffer.from(outputByteArray);
    }
}

const methodProxyMap = {
    'augment': 'add', 'diminish': 'sub', 'amplify': 'mul', 'partition': 'div', 'remainderOf': 'mod',
    'absoluteForm': 'abs', 'oppositeSign': 'neg', 'modularPower': 'powm', 'exponentiate': 'pow',
    'bitShiftLeft': 'shiftLeft', 'bitShiftRight': 'shiftRight', 'evaluateComparison': 'cmp',
    'isGreater': 'gt', 'isGreaterEqual': 'ge', 'isEqual': 'eq', 'isNotEqual': 'ne',
    'isLesser': 'lt', 'isLesserEqual': 'le', 'bitwiseAnd': 'and', 'bitwiseOr': 'or',
    'bitwiseXor': 'xor', 'squareRoot': 'sqrt', 'nthRoot': 'root', 'randomWithinRange': 'rand',
    'modularInverse': 'invertm'
};

Object.entries(methodProxyMap).forEach(([internalMethodName, externalMethodName]) => {
    if (externalMethodName === 'inspect' || externalMethodName === 'toString') return;

    ScalarMagnitude[externalMethodName] = function (firstArgument, ...remainingArguments) {
        const instance = new ScalarMagnitude(firstArgument);
        return instance[internalMethodName](...remainingArguments);
    };
});

ScalarMagnitude.generatePrime.originalName = 'prime';
ScalarMagnitude.fromByteSequence.originalName = 'fromBuffer';

module.exports = ScalarMagnitude;