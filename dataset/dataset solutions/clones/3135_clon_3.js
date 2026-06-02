function processInputData(rawData) {
    const lineSeparator = "\n";
    const valueSeparator = " ";

    const parseNumericLine = (lineContent) => {
        return lineContent.split(valueSeparator).map(Number);
    };

    const allInputLines = rawData.split(lineSeparator);

    const firstLineValues = parseNumericLine(allInputLines[0]);
    const secondLineValues = parseNumericLine(allInputLines[1]);

    const containerDimensionRow = firstLineValues[0];
    const containerDimensionCol = firstLineValues[1];

    const stencilDimensionRow = secondLineValues[0];
    const stencilDimensionCol = secondLineValues[1];

    const effectiveRowSpace = containerDimensionRow - stencilDimensionRow;
    const effectiveColSpace = containerDimensionCol - stencilDimensionCol;

    const finalCalculatedValue = effectiveRowSpace * effectiveColSpace;

    console.log(finalCalculatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
