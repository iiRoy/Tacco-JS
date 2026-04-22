function ProcessNumericData(sourceData) {
    const numericValue = parseInt(sourceData, 10);

    const requiredExponent = Math.ceil(Math.log2(numericValue + 1));

    const finalResult = (1 << requiredExponent) - 1;

    console.log(finalResult);
}

ProcessNumericData(require("fs").readFileSync("/dev/stdin", "utf8"));