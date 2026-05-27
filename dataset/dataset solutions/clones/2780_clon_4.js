function Main(sourceText) {
    const primarySymbol = sourceText.charAt(0);
    const symbolIndices = [];

    for (let i = 0; i < sourceText.length; i++) {
        if (sourceText.charAt(i) === primarySymbol) {
            symbolIndices.push(i);
        }
    }

    const exclusionIndices = new Set();
    exclusionIndices.add(symbolIndices[0]);

    if (symbolIndices.length > 1) {
        exclusionIndices.add(symbolIndices[1]);
    } else {
        exclusionIndices.add(sourceText.length - 1);
    }

    const finalElements = sourceText.split('').filter((_, idx) => !exclusionIndices.has(idx));

    if (finalElements.length === 2 && finalElements[0] === finalElements[1]) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
