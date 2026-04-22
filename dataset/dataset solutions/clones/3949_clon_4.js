const acquireDimensions = (sourceString) => {
    const numericStrings = sourceString.split('\n')[0].split(' ');
    return numericStrings.map(Number);
};

const formInitialLayout = (rows, columns, primarySymbol, secondarySymbol, dividerRow) => {
    return Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: columns }, (_, colIndex) =>
            rowIndex < dividerRow ? primarySymbol : secondarySymbol
        )
    );
};

const generateModifications = (countLimit, offsetFactor, rowPositionCalc, colPositionCalc, characterToPlace) => {
    return Array.from({ length: Math.max(0, countLimit - 1) }, (_, iterationIndex) => {
        const rowCoord = rowPositionCalc(iterationIndex, offsetFactor);
        const colCoord = colPositionCalc(iterationIndex, offsetFactor);
        return { r: rowCoord, c: colCoord, char: characterToPlace };
    });
};

const applyAlterations = (baseLayout, alterations) => {
    const alteredLayout = baseLayout.map(row => [...row]); // Create a deep copy
    alterations.forEach(change => {
        if (change.r >= 0 && change.r < alteredLayout.length &&
            change.c >= 0 && change.c < alteredLayout[0].length) {
            alteredLayout[change.r][change.c] = change.char;
        }
    });
    return alteredLayout;
};

const processVisuals = (incomingText) => {
    const [alphaQuantity, betaQuantity] = acquireDimensions(incomingText);

    const totalHeight = 100;
    const totalWidth = 100;
    const splitPointRow = 50;

    const topHalfRowFunction = (idx, factor) => Math.round(idx / factor) * 2;
    const bottomHalfRowFunction = (idx, factor) => totalHeight - 1 - (Math.round(idx / factor) * 2);
    const sharedColFunction = (idx, factor) => (idx % factor) * 2;
    const coordinateScalingFactor = 50;

    const initialCanvas = formInitialLayout(totalHeight, totalWidth, '.', '#', splitPointRow);

    const betaPatches = generateModifications(betaQuantity, coordinateScalingFactor, topHalfRowFunction, sharedColFunction, '#');
    const intermediateCanvas = applyAlterations(initialCanvas, betaPatches);

    const alphaPatches = generateModifications(alphaQuantity, coordinateScalingFactor, bottomHalfRowFunction, sharedColFunction, '.');
    const finalCanvas = applyAlterations(intermediateCanvas, alphaPatches);

    const finalRenderedOutput = finalCanvas.map(row => row.join('')).join('\n');

    return finalRenderedOutput;
};

const entryPoint = (inputPayload) => {
    const displayResult = processVisuals(inputPayload);
    console.log('%s', displayResult);
};

if (typeof require !== 'undefined' && require.main === module) {
    entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
} else if (typeof document !== 'undefined') {
    window.renderDebug = () => {
        const inputField = document.getElementById("input");
        if (inputField) {
            entryPoint(inputField.value);
        }
    };
}