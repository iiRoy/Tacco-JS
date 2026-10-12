function processInput(sourceString) {
    const digitValues = Array.from(sourceString, Number);
    const finalSum = digitValues.reduce((currentAccumulator, singleDigit) => currentAccumulator + singleDigit, 0);
    console.log(finalSum);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
