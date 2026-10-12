const retrieveStandardInput = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

const applyBitwiseXOR = (numericVal, xorOperand) => {
    return numericVal ^ xorOperand;
};

function processInputData(rawInputString) {
    const numericValue = Number(rawInputString);
    const XOR_VALUE = 1;
    const finalResult = applyBitwiseXOR(numericValue, XOR_VALUE);
    console.log(finalResult);
}

processInputData(retrieveStandardInput());
