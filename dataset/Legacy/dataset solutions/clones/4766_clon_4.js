(function() {
    const DECIMAL_SEPARATOR = '.';
    const GROUP_SEPARATOR = ',';
    const ZERO = '0';
    const ONE = '1';
    const MINUS = '-';
    const EXP = 'e';
    const DEFAULT_ROUNDING_MODE = 4; // ROUND_HALF_UP
    const defaultSettings = {
        precision: 20,
        roundingMode: DEFAULT_ROUNDING_MODE,
        groupSeparator: '',
        decimalSeparator: '.',
        minFractionDigits: 0,
        maxFractionDigits: 20
    };

    class NumericalMagnitude {
        constructor(initialValue) {
            if (initialValue instanceof NumericalMagnitude) {
                this.value = initialValue.value;
                this.precision = initialValue.precision;
                this.roundingMode = initialValue.roundingMode;
                this.stripTrailingZeros = initialValue.stripTrailingZeros;
                return;
            }

            if (typeof initialValue === 'number') {
                if (isNaN(initialValue) || !isFinite(initialValue)) {
                    throw new Error('Invalid numeric input: ' + initialValue);
                }
                initialValue = String(initialValue);
            } else if (typeof initialValue !== 'string') {
                throw new Error('Input must be string or number: ' + (typeof initialValue));
            }

            if (initialValue.indexOf(GROUP_SEPARATOR) > -1) {
                initialValue = initialValue.replace(new RegExp('\\' + GROUP_SEPARATOR, 'g'), '');
            }

            if (initialValue.indexOf(EXP) > -1) {
                let [basePart, exponentialPart] = initialValue.split(EXP);
                exponentialPart = parseInt(exponentialPart, 10);
                let [integralDigits, fractionalDigits = ''] = basePart.split(DECIMAL_SEPARATOR);

                if (exponentialPart > 0) {
                    if (exponentialPart >= fractionalDigits.length) {
                        initialValue = integralDigits + fractionalDigits + ZERO.repeat(exponentialPart - fractionalDigits.length);
                    } else {
                        initialValue = integralDigits + fractionalDigits.substring(0, exponentialPart) + DECIMAL_SEPARATOR + fractionalDigits.substring(exponentialPart);
                    }
                } else if (exponentialPart < 0) {
                    exponentialPart = -exponentialPart;
                    if (exponentialPart >= integralDigits.length) {
                        initialValue = MINUS.repeat(integralDigits.startsWith(MINUS)) + ZERO + DECIMAL_SEPARATOR + ZERO.repeat(exponentialPart - integralDigits.length) + integralDigits.replace(MINUS, '') + fractionalDigits;
                    } else {
                        initialValue = integralDigits.substring(0, integralDigits.length - exponentialPart) + DECIMAL_SEPARATOR + integralDigits.substring(integralDigits.length - exponentialPart) + fractionalDigits;
                    }
                }
                if (initialValue.startsWith(DECIMAL_SEPARATOR)) initialValue = ZERO + initialValue;
                if (initialValue.startsWith(MINUS + DECIMAL_SEPARATOR)) initialValue = MINUS + ZERO + initialValue.substring(1);
            }

            this.value = initialValue;
            this.precision = defaultSettings.precision;
            this.roundingMode = defaultSettings.roundingMode;
            this.stripTrailingZeros = false;
            this.trimZeros();
        }

        trimZeros() {
            if (!this.stripTrailingZeros) return;
            if (this.value.indexOf(DECIMAL_SEPARATOR) === -1) return;

            let [integral, fractional] = this.value.split(DECIMAL_SEPARATOR);
            if (fractional.length === 0) {
                this.value = integral;
                return;
            }

            let index = fractional.length - 1;
            while (index >= 0 && fractional[index] === ZERO) {
                index--;
            }
            fractional = fractional.substring(0, index + 1);

            if (fractional.length === 0) {
                this.value = integral;
            } else {
                this.value = integral + DECIMAL_SEPARATOR + fractional;
            }
        }

        add(anotherNumber) {
            let [valX, valY] = NumericalMagnitude._normalizeDecimalPlaces(this, anotherNumber);
            let [intX, fracX] = valX.value.split(DECIMAL_SEPARATOR);
            let [intY, fracY] = valY.value.split(DECIMAL_SEPARATOR);

            let resultingFraction = '';
            let carryOver = 0;

            for (let i = fracX.length - 1; i >= 0; i--) {
                let sumOfDigits = parseInt(fracX[i]) + parseInt(fracY[i]) + carryOver;
                resultingFraction = (sumOfDigits % 10) + resultingFraction;
                carryOver = Math.floor(sumOfDigits / 10);
            }

            let resultingInteger = '';
            let i = intX.length - 1;
            let j = intY.length - 1;

            while (i >= 0 || j >= 0 || carryOver > 0) {
                let sumOfDigits = carryOver;
                if (i >= 0) sumOfDigits += parseInt(intX[i--]);
                if (j >= 0) sumOfDigits += parseInt(intY[j--]);
                resultingInteger = (sumOfDigits % 10) + resultingInteger;
                carryOver = Math.floor(sumOfDigits / 10);
            }

            let finalResult = resultingInteger;
            if (resultingFraction.length > 0) {
                finalResult += DECIMAL_SEPARATOR + resultingFraction;
            }

            return new NumericalMagnitude(finalResult);
        }

        multiply(anotherNumber) {
            let strValA = this.value.replace(DECIMAL_SEPARATOR, '');
            let strValB = anotherNumber.value.replace(DECIMAL_SEPARATOR, '');

            let finalSign = (this.value.startsWith(MINUS) === anotherNumber.value.startsWith(MINUS)) ? '' : MINUS;
            strValA = strValA.replace(MINUS, '');
            strValB = strValB.replace(MINUS, '');

            let totalDecimalPositions = NumericalMagnitude._countDecimalPlaces(this.value) + NumericalMagnitude._countDecimalPlaces(anotherNumber.value);

            let productDigits = NumericalMagnitude._performStringMultiplication(strValA, strValB);

            if (totalDecimalPositions > 0) {
                let integerSegment = productDigits.substring(0, productDigits.length - totalDecimalPositions);
                let fractionalSegment = productDigits.substring(productDigits.length - totalDecimalPositions);
                productDigits = (integerSegment || ZERO) + DECIMAL_SEPARATOR + fractionalSegment;
            }

            return new NumericalMagnitude(finalSign + productDigits);
        }

        toString() {
            return this.value;
        }

        static _countDecimalPlaces(valueString) {
            const separatorIndex = valueString.indexOf(DECIMAL_SEPARATOR);
            return separatorIndex === -1 ? 0 : valueString.length - 1 - separatorIndex;
        }

        static _normalizeDecimalPlaces(valA, valB) {
            let [intA, fracA = ''] = valA.value.split(DECIMAL_SEPARATOR);
            let [intB, fracB = ''] = valB.value.split(DECIMAL_SEPARATOR);

            let maxLen = Math.max(fracA.length, fracB.length);
            fracA = fracA.padEnd(maxLen, ZERO);
            fracB = fracB.padEnd(maxLen, ZERO);

            let normalizedA = new NumericalMagnitude(intA + DECIMAL_SEPARATOR + fracA);
            let normalizedB = new NumericalMagnitude(intB + DECIMAL_SEPARATOR + fracB);
            return [normalizedA, normalizedB];
        }

        static _performStringMultiplication(s1, s2) {
            if (s1 === ZERO || s2 === ZERO) return ZERO;

            let resultArr = Array(s1.length + s2.length).fill(0);

            for (let i = s1.length - 1; i >= 0; i--) {
                let carry = 0;
                let digit1 = parseInt(s1[i]);

                for (let j = s2.length - 1; j >= 0; j--) {
                    let digit2 = parseInt(s2[j]);
                    let sum = digit1 * digit2 + resultArr[i + j + 1] + carry;
                    carry = Math.floor(sum / 10);
                    resultArr[i + j + 1] = sum % 10;
                }
                resultArr[i] += carry;
            }

            return resultArr.join('').replace(/^0+/, '');
        }
    }

    const ArbitraryPrecisionNumber = NumericalMagnitude;

    let receivedInputData = '';
    process.stdin.on('data', incomingDataChunk => {
        receivedInputData += incomingDataChunk;
    });

    process.stdin.on('end', () => {
        const processedInputLines = receivedInputData.trim().split('\n');
        executeDivisorCalculation(processedInputLines);
    });

    function executeDivisorCalculation(processedLines) {
        const topBoundary = Number(processedLines[0]);
        if (isNaN(topBoundary) || topBoundary < 2) {
            console.log(new ArbitraryPrecisionNumber(1).toString());
            return;
        }

        const cumulativePrimePowers = new Map();

        for (let currentIntegerIter = 2; currentIntegerIter <= topBoundary; ++currentIntegerIter) {
            let tempInteger = currentIntegerIter;
            let currentSqrtLimit = Math.floor(Math.sqrt(tempInteger));
            let currentIntegerFactorCount = 0; // Internal counter, not used for final product

            for (let potentialFactor = 2; potentialFactor <= currentSqrtLimit; ++potentialFactor) {
                if (tempInteger % potentialFactor === 0) {
                    currentIntegerFactorCount++;
                    let factorPower = 0;
                    while (tempInteger % potentialFactor === 0) {
                        tempInteger /= potentialFactor;
                        factorPower++;
                    }
                    cumulativePrimePowers.set(
                        potentialFactor,
                        (cumulativePrimePowers.get(potentialFactor) || 0) + factorPower
                    );
                    currentSqrtLimit = Math.floor(Math.sqrt(tempInteger));
                }
            }

            if (tempInteger > 1) {
                currentIntegerFactorCount++;
                cumulativePrimePowers.set(
                    tempInteger,
                    (cumulativePrimePowers.get(tempInteger) || 0) + 1
                );
            }
        }

        let totalDivisorProduct = new ArbitraryPrecisionNumber(1);

        for (const [primeFactor, totalExponent] of cumulativePrimePowers.entries()) {
            const multiplierTerm = new ArbitraryPrecisionNumber(totalExponent + 1);
            totalDivisorProduct = totalDivisorProduct.multiply(multiplierTerm);
        }

        console.log(totalDivisorProduct.toString());
    }

})();