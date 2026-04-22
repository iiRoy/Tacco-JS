const createDataChannel = (inputDataString) => {
    const sourceLines = inputDataString.trim().split('\n');
    let lineCursor = 0;
    let tokenCursor = 0;
    let currentLineSegments = [];

    const parseToNumeric = (text) => +text;

    const prepareLineSegments = () => {
        if (lineCursor < sourceLines.length && tokenCursor >= currentLineSegments.length) {
            currentLineSegments = sourceLines[lineCursor].split(' ');
            tokenCursor = 0;
        }
    };

    const obtainValue = (returnAsString = false) => {
        prepareLineSegments();
        if (lineCursor >= sourceLines.length || tokenCursor >= currentLineSegments.length) {
            return undefined;
        }
        const extracted = currentLineSegments[tokenCursor];
        tokenCursor++;
        if (tokenCursor >= currentLineSegments.length) {
            lineCursor++;
            tokenCursor = 0;
            currentLineSegments = [];
        }
        return returnAsString ? extracted : parseToNumeric(extracted);
    };

    const obtainSequence = (returnAsStrings = false) => {
        if (lineCursor >= sourceLines.length) {
            return undefined;
        }
        const segments = sourceLines[lineCursor].split(' ');
        lineCursor++;
        tokenCursor = 0;
        currentLineSegments = [];
        return returnAsStrings ? segments : segments.map(parseToNumeric);
    };

    const obtainMatrix = (rowCount, returnAsStrings = false) => {
        const collection = [];
        const actualRowCount = Math.min(rowCount, sourceLines.length - lineCursor);
        for (let idx = 0; idx < actualRowCount; idx++) {
            collection.push(sourceLines[lineCursor + idx].split(' '));
        }
        lineCursor += actualRowCount;
        tokenCursor = 0;
        currentLineSegments = [];
        if (returnAsStrings) {
            return collection;
        } else {
            return collection.map(row => row.map(parseToNumeric));
        }
    };

    const obtainNumericRows = (rowCount, returnAsStrings = false) => {
        const collection = [];
        const actualRowCount = Math.min(rowCount, sourceLines.length - lineCursor);
        for (let idx = 0; idx < actualRowCount; idx++) {
            collection.push(sourceLines[lineCursor + idx]);
        }
        lineCursor += actualRowCount;
        tokenCursor = 0;
        currentLineSegments = [];
        return returnAsStrings ? collection : collection.map(parseToNumeric);
    };

    return {
        fetchToken: obtainValue,
        fetchLine: obtainSequence,
        fetchGrid: obtainMatrix,
        fetchNumericRows: obtainNumericRows,
    };
};

const dataProcessor = createDataChannel(require("fs").readFileSync("/dev/stdin", "utf8"));

const constructDimensionalArray = (fillerContent, ...dimensions) => {
    if (dimensions.length === 0) {
        return fillerContent;
    }
    const currentDimensionLength = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionLength }, () =>
        constructDimensionalArray(fillerContent, ...remainingDimensions)
    );
};

const primeNumberModulo = BigInt(1000003);

const executeModularProduct = (...factors) =>
    factors.reduce((accumulator, current) => (accumulator * BigInt(current)) % primeNumberModulo, BigInt(1));

const factorialCache = [BigInt(1), BigInt(1)];

const populateFactorialCache = (upperBound) => {
    for (let counter = 2; counter <= upperBound; counter++) {
        factorialCache[counter] = executeModularProduct(factorialCache[counter - 1], BigInt(counter));
    }
};

const determineMultiplicativeInverse = (baseValue) => {
    let a = BigInt(baseValue);
    let b = primeNumberModulo;
    let x = BigInt(1);
    let y = BigInt(0);

    while (b !== BigInt(0)) {
        const q = a / b;
        let tempA = a - q * b;
        a = b;
        b = tempA;

        let tempX = x - q * y;
        x = y;
        y = tempX;
    }
    return (x % primeNumberModulo + primeNumberModulo) % primeNumberModulo;
};

const deriveModularPermutation = (totalElements, chosenElements) => {
    if (chosenElements < 0 || chosenElements > totalElements) return BigInt(0);
    if (chosenElements === 0 || totalElements === 0) return BigInt(1);

    const difference = totalElements - chosenElements;
    return executeModularProduct(factorialCache[totalElements], determineMultiplicativeInverse(factorialCache[difference]));
};

const calculateModularExponentiation = (base, exponent) => {
    let result = BigInt(1);
    let currentBase = BigInt(base) % primeNumberModulo;
    let currentExponent = BigInt(exponent);

    while (currentExponent > BigInt(0)) {
        if (currentExponent % BigInt(2) === BigInt(1)) {
            result = executeModularProduct(result, currentBase);
        }
        currentBase = executeModularProduct(currentBase, currentBase);
        currentExponent = currentExponent / BigInt(2);
    }
    return result;
};

const performCalculation = () => {
    const queryQuantity = dataProcessor.fetchToken();
    populateFactorialCache(primeNumberModulo);

    const outcomeCollection = Array.from({ length: queryQuantity }, () => {
        const [valueX, valueD, valueN] = dataProcessor.fetchLine();

        if (valueN >= primeNumberModulo) {
            return BigInt(0);
        } else if (valueD === 0) {
            return calculateModularExponentiation(valueX, valueN);
        } else {
            const dInv = determineMultiplicativeInverse(valueD);
            const termProduct = executeModularProduct(valueX, dInv);
            const adjustedTermA = (primeNumberModulo - termProduct + primeNumberModulo) % primeNumberModulo;

            const permutationResult = deriveModularPermutation(adjustedTermA, valueN);
            const powerBase = (primeNumberModulo - BigInt(valueD) + primeNumberModulo) % primeNumberModulo;
            const powerResult = calculateModularExponentiation(powerBase, valueN);

            return executeModularProduct(permutationResult, powerResult);
        }
    });
    return outcomeCollection.map(val => val.toString()).join("\n");
};

console.log(performCalculation());