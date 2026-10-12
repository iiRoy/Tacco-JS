"use strict";

const produceInputInterpreter = (sourceData) => {
    let allLines = sourceData.trim().split('\n');
    let processedLines = allLines.map(line => line.split(' '));
    let lineCursor = 0;
    let tokenCursor = 0;

    const readSingleValue = (asNumber = true) => {
        while (lineCursor < processedLines.length && processedLines[lineCursor].length === 0) {
            lineCursor++;
            tokenCursor = 0;
        }
        if (lineCursor >= processedLines.length) {
            throw new Error("No more input tokens available.");
        }
        if (tokenCursor >= processedLines[lineCursor].length) {
            lineCursor++;
            tokenCursor = 0;
            return readSingleValue(asNumber);
        }
        const token = processedLines[lineCursor][tokenCursor++];
        return asNumber ? parseInt(token, 10) : token;
    };

    const readFullLine = (asNumbers = true) => {
        if (lineCursor >= processedLines.length) {
            throw new Error("No more input lines available.");
        }
        const remainingTokens = processedLines[lineCursor].slice(tokenCursor);
        lineCursor++;
        tokenCursor = 0;
        return asNumbers ? remainingTokens.map(s => parseInt(s, 10)) : remainingTokens;
    };

    const readBlockOfLines = (count, asNumbers = true) => {
        const block = [];
        for (let i = 0; i < count; i++) {
            block.push(readFullLine(asNumbers));
        }
        return block;
    };

    const readSequenceOfValues = (count, asNumbers = true) => {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(readSingleValue(asNumbers));
        }
        return sequence;
    };

    return {
        fetchOne: readSingleValue,
        fetchLine: readFullLine,
        fetchMatrix: readBlockOfLines,
        fetchList: readSequenceOfValues
    };
};

const createNestedArray = (dimensions, initialValue) => {
    const generator = (dims) => {
        if (dims.length === 1) {
            return Array(dims[0]).fill(initialValue);
        }
        return Array(dims[0]).fill(0).map(() => generator(dims.slice(1)));
    };
    return generator(dimensions);
};

const ArithmeticSystem = (modulusValue) => {
    const MOD_BIGINT = BigInt(modulusValue);
    const MOD_NUMBER = modulusValue;
    let storedFactorials = [];
    let storedInverseFactorials = [];
    let storedInverses = [];
    let storedTwoPowers = [];

    const productByModulo = (...terms) => {
        let result = 1n;
        for (const term of terms) {
            result = (result * BigInt(term)) % MOD_BIGINT;
        }
        return Number(result);
    };

    const powerByModulo = (base, exponent) => {
        let res = 1n;
        let b = BigInt(base);
        let e = BigInt(exponent);
        while (e > 0n) {
            if (e % 2n === 1n) res = (res * b) % MOD_BIGINT;
            b = (b * b) % MOD_BIGINT;
            e /= 2n;
        }
        return Number(res);
    };

    const extendedEuclideanAlgorithm = (a, b) => {
        let [oldR, r] = [BigInt(a), BigInt(b)];
        let [oldS, s] = [1n, 0n];

        while (r !== 0n) {
            let quotient = oldR / r;
            [oldR, r] = [r, oldR - quotient * r];
            [oldS, s] = [s, oldS - quotient * s];
        }
        return oldS;
    };

    const getModularInverse = (num) => {
        let inv = extendedEuclideanAlgorithm(num, MOD_BIGINT);
        return Number((inv % MOD_BIGINT + MOD_BIGINT) % MOD_BIGINT);
    };

    const setupPrecomputedTables = (upperBound) => {
        storedFactorials[0] = 1n;
        for (let i = 1; i <= upperBound; i++) {
            storedFactorials[i] = (storedFactorials[i - 1] * BigInt(i)) % MOD_BIGINT;
        }

        storedInverseFactorials[upperBound] = BigInt(getModularInverse(Number(storedFactorials[upperBound])));
        for (let i = upperBound - 1; i >= 0; i--) {
            storedInverseFactorials[i] = (storedInverseFactorials[i + 1] * BigInt(i + 1)) % MOD_BIGINT;
        }

        storedInverses[0] = 0n;
        storedInverses[1] = 1n;
        for (let i = 2; i <= upperBound; i++) {
            storedInverses[i] = productByModulo(storedFactorials[i - 1], storedInverseFactorials[i]);
        }

        storedTwoPowers[0] = 1;
        for (let i = 1; i <= upperBound; i++) {
            storedTwoPowers[i] = productByModulo(storedTwoPowers[i - 1], 2);
        }
    };

    return {
        initialize: setupPrecomputedTables,
        product: productByModulo,
        exponentiate: powerByModulo,
        inverse: getModularInverse,
        getFactorial: (n) => Number(storedFactorials[n]),
        getInverseFactorial: (n) => Number(storedInverseFactorials[n]),
        getInverseNum: (n) => Number(storedInverses[n]),
        getPowerOfTwo: (n) => storedTwoPowers[n],
        getCombinations: (n, k) => {
            if (k < 0 || k > n) return 0;
            return productByModulo(storedFactorials[n], storedInverseFactorials[k], storedInverseFactorials[n - k]);
        },
        getPermutations: (n, k) => {
            if (k < 0 || k > n) return 0;
            return productByModulo(storedFactorials[n], storedInverseFactorials[n - k]);
        },
        retrieveModulus: () => MOD_NUMBER
    };
};

const executeProblemSolution = () => {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataInterpreter = produceInputInterpreter(fileContent);

    const problemSize = dataInterpreter.fetchOne();
    const coordinateArray = dataInterpreter.fetchLine();

    const PRIME_MODULUS = 1000000007;
    const modularCalculator = ArithmeticSystem(PRIME_MODULUS);
    modularCalculator.initialize(problemSize + 1);

    const initialAccumulationState = {
        totalAccumulatedSum: 0,
        currentFractionalU: modularCalculator.getFactorial(problemSize - 1)
    };

    const iterationRange = Array.from({ length: problemSize - 1 }, (_, index) => index + 1);

    const finalResultState = iterationRange.reduce((currentAcc, i) => {
        const deltaCoords = coordinateArray[i] - coordinateArray[i - 1];
        const termToAdd = modularCalculator.product(deltaCoords, currentAcc.currentFractionalU);
        
        let nextTotalSum = (currentAcc.totalAccumulatedSum + termToAdd) % PRIME_MODULUS;
        if (nextTotalSum < 0) nextTotalSum += PRIME_MODULUS;

        const updateComponentForU = modularCalculator.product(modularCalculator.getFactorial(problemSize - 1), modularCalculator.getInverseNum(i + 1));
        let nextFractionalU = (currentAcc.currentFractionalU + updateComponentForU) % PRIME_MODULUS;
        if (nextFractionalU < 0) nextFractionalU += PRIME_MODULUS;
        
        return {
            totalAccumulatedSum: nextTotalSum,
            currentFractionalU: nextFractionalU
        };
    }, initialAccumulationState);

    return (finalResultState.totalAccumulatedSum % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
};

console.log(executeProblemSolution());