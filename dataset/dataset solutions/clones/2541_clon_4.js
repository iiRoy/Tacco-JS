function executeGridPattern(inputString) {
    const [heightDim, widthDim, colSplit, rowSplit] = inputString
        .split("\n")[0]
        .split(" ")
        .map(Number);

    const patternGrid = Array.from({ length: heightDim }, (_, rowIndex) =>
        Array.from({ length: widthDim }, (_, colIndex) =>
            Number((colIndex < colSplit) ^ (rowIndex < rowSplit))
        ).join("")
    );

    console.log(patternGrid.join("\n"));
}

executeGridPattern(require("fs").readFileSync("/dev/stdin", "utf8"));
