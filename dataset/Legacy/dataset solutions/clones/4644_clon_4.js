function evaluateProgression(sourceData) {
    const [valA, valB, valC] = sourceData.split(" ").map(parseFloat);
    const formsArithmeticSeries = (2 * valB) === (valA + valC);
    console.log(["NO", "YES"][+formsArithmeticSeries]);
}
evaluateProgression(require("fs").readFileSync("/dev/stdin", "utf8").trim());
