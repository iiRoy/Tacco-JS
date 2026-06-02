function computeSumFromInput(sourceText) {
    const contentRows = sourceText.split("\n");

    const relevantSegments = contentRows.slice(1, contentRows.length - 2);

    const accumulatedValue = relevantSegments.reduce((currentTotal, currentLineSegment) => {
        const parts = currentLineSegment.split(' ');
        const numericPart = Number(parts[1]);
        return currentTotal + numericPart;
    }, 0);

    console.log(accumulatedValue);
}

computeSumFromInput(require("fs").readFileSync("/dev/stdin", "utf8"));
