function retrieveChar(kindIdentifier, rowInBlock, colInBlock, primarySymbol, secondarySymbol) {
    switch (kindIdentifier) {
        case 0: // Initial or MinorLimit (bb === valB)
            return (rowInBlock < 3) ? ((colInBlock < 3) ? primarySymbol : secondarySymbol) : secondarySymbol;
        case 1: // MajorLimit (aa === valA)
            return secondarySymbol;
        case 3: // Standard (else case)
            if (rowInBlock === 0 || rowInBlock === 2) {
                return (colInBlock < 3) ? primarySymbol : secondarySymbol;
            } else if (rowInBlock === 1) {
                return (colInBlock % 2 === 0) ? primarySymbol : secondarySymbol;
            } else { // rowInBlock === 3
                return secondarySymbol;
            }
        default:
            return '?'; // Should not happen
    }
}

function processMatrix(sourceData) {
    const numericInputs = sourceData.match(/\d+/g).map(Number);
    const [valueOne, valueTwo] = numericInputs;

    const charDot = (valueOne > valueTwo) ? '.' : '#';
    const charHash = (valueOne > valueTwo) ? '#' : '.';

    const principalCount = (valueOne > valueTwo) ? valueOne : valueTwo;
    const secondaryCount = (valueOne > valueTwo) ? valueTwo : valueOne;

    const matrixDimension = Math.ceil(Math.sqrt(principalCount)) * 4;
    const blockUnitsPerSide = matrixDimension / 4;
    const totalBlockUnits = blockUnitsPerSide * blockUnitsPerSide;

    const blockStateEvolution = Array.from({ length: totalBlockUnits }).reduce((history, _, currentBlockIndex) => {
        const currentPrincipalCounter = history.length === 0 ? 1 : history[history.length - 1].nextPrincipal;
        const currentSecondaryCounter = history.length === 0 ? 1 : history[history.length - 1].nextSecondary;

        let nextPrincipalCounter = currentPrincipalCounter;
        let nextSecondaryCounter = currentSecondaryCounter;
        let blockPatternKind; // 0: initial/secondary, 1: principal_limit, 3: standard

        if (currentBlockIndex === 0) {
            blockPatternKind = 0;
        } else if (currentPrincipalCounter === principalCount) {
            blockPatternKind = 1;
        } else if (currentSecondaryCounter === secondaryCount) {
            blockPatternKind = 0; // Same pattern as initial
            nextPrincipalCounter++;
        } else {
            blockPatternKind = 3;
            nextPrincipalCounter++;
            nextSecondaryCounter++;
        }
        history.push({ blockPatternKind, nextPrincipal: nextPrincipalCounter, nextSecondary: nextSecondaryCounter });
        return history;
    }, []);

    const finalOutputMatrix = Array.from({ length: matrixDimension }, (_, rowIndex) => {
        return Array.from({ length: matrixDimension }, (_, colIndex) => {
            const blockRowCoordinate = Math.floor(rowIndex / 4);
            const blockColCoordinate = Math.floor(colIndex / 4);
            const absoluteBlockIndex = blockRowCoordinate * blockUnitsPerSide + blockColCoordinate;

            const rowInsideBlock = rowIndex % 4;
            const colInsideBlock = colIndex % 4;

            const blockProperties = blockStateEvolution[absoluteBlockIndex];
            return retrieveChar(blockProperties.blockPatternKind, rowInsideBlock, colInsideBlock, charDot, charHash);
        }).join('');
    });

    console.log(`${matrixDimension} ${matrixDimension}\n${finalOutputMatrix.join('\n')}`);
}

processMatrix(require("fs").readFileSync("/dev/stdin", "utf8").trim());