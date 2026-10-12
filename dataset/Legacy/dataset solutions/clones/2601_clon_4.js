function ProcessInputAndCompute(inputContentString) {
    const inputNumericValue = BigInt(inputContentString.split("\n")[0]);
    
    const resultValue = (inputNumericValue * (inputNumericValue - 1n)) / 2n;
    
    console.log(resultValue.toString());
}

ProcessInputAndCompute(require("node:fs").readFileSync("/dev/stdin", "utf8"));