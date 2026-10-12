const primeDivisor = 1000003;

const factorialCache = new Map([[0, 1], [1, 1]]);

const obtainFactorial = (num) => {
    if (factorialCache.has(num)) {
        return factorialCache.get(num);
    }
    const result = multiplyMod(num, obtainFactorial(num - 1));
    factorialCache.set(num, result);
    return result;
};

const multiplyMod = (val1, val2) => (val1 * val2) % primeDivisor;

const findModularInverse = (num) => {
    let a = num, b = primeDivisor;
    let x0 = 1, x1 = 0;
    while (b !== 0) {
        const q = Math.floor(a / b);
        [a, b] = [b, a % b];
        [x0, x1] = [x1, x0 - q * x1];
    }
    return (x0 % primeDivisor + primeDivisor) % primeDivisor;
};

const calculateModularPower = (baseVal, exponent) => {
    if (exponent === 0) return 1;
    if (exponent === 1) return baseVal % primeDivisor;
    
    let halfPower = calculateModularPower(baseVal, Math.floor(exponent / 2));
    halfPower = multiplyMod(halfPower, halfPower);
    
    if (exponent % 2 === 1) {
        halfPower = multiplyMod(halfPower, baseVal);
    }
    return halfPower;
};

const calculatePermutationsMod = (totalItems, selectedItems) => {
    if (selectedItems > totalItems) return 0;
    
    const numFactorial = obtainFactorial(totalItems);
    const denFactorialInverse = findModularInverse(obtainFactorial(totalItems - selectedItems));
    
    return multiplyMod(numFactorial, denFactorialInverse);
};

const createStreamHandler = (rawInput) => {
    let allLines = rawInput.trim().split('\n');
    let lineCursor = 0;
    let currentLineFragment = [];

    const advanceLineFragment = () => {
        while (currentLineFragment.length === 0 && lineCursor < allLines.length) {
            const lineContent = allLines[lineCursor];
            const parts = lineContent.split(' ');
            if (parts.length === 1 && parts[0] === '') {
                lineCursor++;
            } else {
                currentLineFragment = parts;
                lineCursor++;
            }
        }
    };

    const retrieveSingle = (isNumeric = true) => {
        advanceLineFragment();
        if (currentLineFragment.length === 0) return undefined;
        
        const item = currentLineFragment.shift();
        return isNumeric ? Number(item) : item;
    };

    const retrieveAllOnLine = (isNumeric = true) => {
        if (lineCursor >= allLines.length) return undefined;
        
        const line = allLines[lineCursor++];
        const items = line.split(' ');
        return isNumeric ? items.map(Number) : items;
    };

    const retrieveLineBlock = (numLines, isNumeric = true) => {
        if (lineCursor + numLines > allLines.length) return undefined;
        
        const block = allLines.slice(lineCursor, lineCursor + numLines);
        lineCursor += numLines;
        return isNumeric ? block.map(Number) : block;
    };

    const retrieveGridBlock = (numRows, isNumeric = true) => {
        if (lineCursor + numRows > allLines.length) return undefined;
        
        const gridLines = allLines.slice(lineCursor, lineCursor + numRows);
        lineCursor += numRows;
        
        const grid = gridLines.map(line => line.split(' '));
        return isNumeric ? grid.map(row => row.map(Number)) : grid;
    };

    return {
        getItem: retrieveSingle,
        getLineItems: retrieveAllOnLine,
        getLineBlock: retrieveLineBlock,
        getGridBlock: retrieveGridBlock,
    };
};

const executeSolution = () => {
    const dataStream = createStreamHandler(require("fs").readFileSync("/dev/stdin","utf8"));

    obtainFactorial(primeDivisor - 1);

    const queryCount = dataStream.getItem();

    const finalResults = Array.from({ length: queryCount }, () => {
        const [queryX, queryD, queryN] = dataStream.getLineItems();

        if (queryN >= primeDivisor || queryX === 0) {
            return 0;
        }

        if (queryD === 0) {
            return calculateModularPower(queryX, queryN);
        } else {
            const termA = (primeDivisor - multiplyMod(queryX, findModularInverse(queryD))) % primeDivisor;
            
            const termP = calculatePermutationsMod(termA, queryN);
            
            const termM = calculateModularPower(primeDivisor - queryD, queryN);
            
            return multiplyMod(termP, termM);
        }
    });

    return finalResults.join("\n");
};

console.log(executeSolution());