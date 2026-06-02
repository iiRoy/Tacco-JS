const calculateProduct = (sourceLines) => {
    const [initialLine] = sourceLines;
    const numericComponents = initialLine.split(' ').map(Number);

    const resultValue = Math.floor(numericComponents[2] / numericComponents[0]) * numericComponents[1];

    console.log(resultValue);
};

calculateProduct(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
