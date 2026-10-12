function processInput(rawData) {
    const sourceLines = rawData.split("\n");
    const desiredProduct = parseInt(sourceLines[0], 10);

    const digitRange = Array.from({ length: 9 }, (_, index) => index + 1);

    const canBeFormed = digitRange.some(firstFactor => {
        return digitRange.some(secondFactor => {
            return firstFactor * secondFactor === desiredProduct;
        });
    });

    console.log(canBeFormed ? "yes" : "no");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
