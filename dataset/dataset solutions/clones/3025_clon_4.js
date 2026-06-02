"use strict";

class InputReader {
    #tokenStream;
    #valueParser;

    constructor(sourceText, parserFunction = Number) {
        this.#valueParser = parserFunction;
        this.#tokenStream = this.#generateTokens(sourceText);
    }

    *#generateTokens(text) {
        const lines = text.split('\n');
        for (const lineContent of lines) {
            const parts = lineContent.trim().split(' ');
            for (const part of parts) {
                if (part !== '') {
                    yield this.#valueParser(part);
                }
            }
        }
    }

    grab() {
        const { value, done } = this.#tokenStream.next();
        return done ? undefined : value;
    }
}

function obtainPrimes(upperBound) {
    const primeFlags = new Map();
    for (let i = 2; i <= upperBound; i++) {
        primeFlags.set(i, true);
    }

    for (let p = 2; p * p <= upperBound; p++) {
        if (primeFlags.get(p)) {
            for (let multiple = p * p; multiple <= upperBound; multiple += p) {
                primeFlags.set(multiple, false);
            }
        }
    }

    return Array.from(primeFlags.entries())
                .filter(([, isPrime]) => isPrime)
                .map(([num]) => num);
}

function computeGCD(valA, valB) {
    while (valB !== 0) {
        const temporary = valB;
        valB = valA % valB;
        valA = temporary;
    }
    return valA;
}

function* factorizeNumber(numberToFactor, primeList) {
    let currentNumber = numberToFactor;
    for (const p of primeList) {
        if (p * p > currentNumber) break;
        while (currentNumber % p === 0) {
            yield p;
            currentNumber /= p;
        }
    }
    if (currentNumber > 1) {
        yield currentNumber;
    }
}

const GLOBAL_PRIME_LIST = obtainPrimes(100000);

function processData(inputContent) {
    const inputReader = new InputReader(inputContent);

    const countElements = inputReader.grab();
    const initialValues = Array.from({ length: countElements + 1 }, () => inputReader.grab());
    const reversedValues = initialValues.toReversed();

    const overallCommonDivisor = reversedValues.reduce((accumulator, current) => computeGCD(accumulator, current));

    const scaledValues = reversedValues.map(val => val / overallCommonDivisor);

    const primesForConditionCheck = GLOBAL_PRIME_LIST.filter(p => p <= countElements);

    const primesSatisfyingConditions = primesForConditionCheck.filter(currentPrime => {
        if (scaledValues[0] % currentPrime !== 0) {
            return false;
        }

        return Array.from({ length: currentPrime - 1 }, (_, index) => index + 1)
            .every(startIndex => {
                let currentSum = 0;
                for (let k = startIndex; k <= countElements; k += (currentPrime - 1)) {
                    currentSum += scaledValues[k];
                }
                return currentSum % currentPrime === 0;
            });
    });

    const primeFactorsOfGCD = [...factorizeNumber(overallCommonDivisor, GLOBAL_PRIME_LIST)];

    const allCollectedFactors = [...primesSatisfyingConditions, ...primeFactorsOfGCD];
    const uniqueSortedFactors = Array.from(new Set(allCollectedFactors)).sort((a, b) => a - b);

    uniqueSortedFactors.forEach(factor => console.log(factor));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
