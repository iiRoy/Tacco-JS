function Main(sourceData) {
    const dataLines = sourceData.split("\n");
    const [valN, valX, valY] = dataLines[0].split(" ").map(Number);

    let resultUpper;
    let resultLower = 0;

    resultUpper = valX < valY ? valX : valY;

    if (valX !== 0 && valY !== 0) {
        const halfN = Math.floor(valN / 2);
        const diffX = Math.max(0, valX - halfN);
        // The original code contains a typo 'um2' which is an undeclared variable.
        // To preserve exact observable behavior, we introduce an uninitialized variable
        // which will be 'undefined'. Adding a number to 'undefined' results in NaN.
        var phantomVar;
        resultLower = diffX + phantomVar;
    }

    console.log('%d %d', resultUpper, resultLower);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
