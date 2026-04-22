const makeInputReader = (rawData) => {
    let allLines = rawData.split('\n').map(l => l.trim()).filter(Boolean);
    let lineCursor = 0;
    let tokenBuffer = [];

    const refillTokenBuffer = () => {
        if (lineCursor < allLines.length) {
            tokenBuffer = allLines[lineCursor].split(/\s+/).filter(Boolean);
            lineCursor++;
        } else {
            tokenBuffer = [];
        }
    };

    refillTokenBuffer(); // Populate buffer with first line's tokens

    const obtainNextNumericValue = () => {
        while (tokenBuffer.length === 0 && lineCursor <= allLines.length) {
            refillTokenBuffer();
        }
        if (tokenBuffer.length > 0) {
            return Number(tokenBuffer.shift());
        }
        return NaN; // Indicate end of stream or error
    };

    const obtainAllNumericValuesOnCurrentLine = () => {
        while (tokenBuffer.length === 0 && lineCursor <= allLines.length) {
            refillTokenBuffer();
        }
        if (tokenBuffer.length > 0) {
            const lineValues = tokenBuffer.map(Number);
            tokenBuffer = []; // Consume all tokens on this line
            return lineValues;
        }
        return [];
    };

    const obtainNumericMatrix = (rowsToRead) => {
        const resultMatrix = [];
        for (let i = 0; i < rowsToRead; i++) {
            resultMatrix.push(obtainAllNumericValuesOnCurrentLine());
        }
        return resultMatrix;
    };

    const obtainNumericVector = (elementsToRead) => {
        const resultVector = [];
        // Ensure token buffer is cleared if a line was partially read before this call
        tokenBuffer = []; 
        for (let i = 0; i < elementsToRead; i++) {
            if (lineCursor < allLines.length) {
                resultVector.push(Number(allLines[lineCursor].trim()));
                lineCursor++;
            } else {
                resultVector.push(NaN); // Or handle error appropriately
            }
        }
        return resultVector;
    };

    return {
        getNumerical: obtainNextNumericValue,
        getLineNumerics: obtainAllNumericValuesOnCurrentLine,
        getNumericGrid: obtainNumericMatrix,
        getNumericArray: obtainNumericVector,
    };
};

const processInputAndSolve = () => {
    const dataSource = makeInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalBits = dataSource.getNumerical();
    const initialConfiguration = dataSource.getNumerical();
    const finalConfiguration = dataSource.getNumerical();

    let aggregateBitSum = 0;
    for (let currentBitPosition = 0; currentBitPosition < totalBits; currentBitPosition++) {
        const bitMask = 1 << currentBitPosition;
        if ((initialConfiguration & bitMask) !== 0) aggregateBitSum++;
        if ((finalConfiguration & bitMask) !== 0) aggregateBitSum++;
    }

    if (aggregateBitSum % 2 === 0) {
        return "NO";
    }

    const generatedPath = [];
    
    const buildGrayPath = (currentBinary, targetBinary, restrictedBitPositions, maxBitWidth, pathCollector) => {
        if (currentBinary === targetBinary) {
            pathCollector.push(currentBinary);
            return;
        }

        const differingBitPattern = currentBinary ^ targetBinary;
        let selectedSameBitPower = 0;
        let selectedDifferentBitPower = 0;

        for (let bitPosition = 0; bitPosition < maxBitWidth; bitPosition++) {
            const bitPower = 1 << bitPosition;
            if (restrictedBitPositions.has(bitPosition)) continue;

            if ((differingBitPattern & bitPower) === 0) { // Bit is same in currentBinary and targetBinary
                if (selectedSameBitPower === 0) { // Found the first available same bit
                    selectedSameBitPower = bitPower;
                }
            } else { // Bit is different in currentBinary and targetBinary
                if (selectedDifferentBitPower === 0) { // Found the first available different bit
                    selectedDifferentBitPower = bitPower;
                }
            }
            if (selectedSameBitPower !== 0 && selectedDifferentBitPower !== 0) break;
        }

        const firstIntermediate = currentBinary ^ selectedSameBitPower;
        const secondIntermediate = currentBinary ^ selectedSameBitPower ^ selectedDifferentBitPower;

        buildGrayPath(currentBinary, firstIntermediate, restrictedBitPositions, maxBitWidth, pathCollector);

        const newRestrictedBitPositions = new Set(restrictedBitPositions);
        newRestrictedBitPositions.add(Math.log2(selectedDifferentBitPower));

        buildGrayPath(secondIntermediate, targetBinary, newRestrictedBitPositions, maxBitWidth, pathCollector);
    };

    buildGrayPath(initialConfiguration, finalConfiguration, new Set(), totalBits, generatedPath);

    console.log("YES");
    return generatedPath.join(" ");
};

console.log(processInputAndSolve());