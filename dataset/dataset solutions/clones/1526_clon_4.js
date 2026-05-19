function calculateMaxCrossProduct(numericString) {
    const parsedValues = numericString.split(" ").map(parseFloat);
    const [valA, valB, valC, valD] = parsedValues;

    const productSet = [
        valA * valC,
        valA * valD,
        valB * valC,
        valB * valD
    ];

    return Math.max(...productSet);
}

console.log(calculateMaxCrossProduct(require("fs").readFileSync("/dev/stdin", "utf8")));
