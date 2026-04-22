function processInputData(rawData) {
    const numericSequence = "0101010201020105020201050102011401050105020201150202050401040151";
    const digitWidth = 2;

    const requestedPosition = +rawData;

    const startCharIndex = (requestedPosition - 1) * digitWidth;

    const extractedDigits = numericSequence.substring(startCharIndex, startCharIndex + digitWidth);

    const finalValue = Number(extractedDigits);

    console.log(finalValue);
}

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));