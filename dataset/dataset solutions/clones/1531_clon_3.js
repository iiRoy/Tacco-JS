function processInputData(rawDataString){
    const MODULO_CONSTANT = 10**9 + 7;
    const numericInput = Number(rawDataString);
    const decrementedValue = numericInput - 1;
    const intermediateProduct = numericInput * decrementedValue;
    const finalResult = intermediateProduct % MODULO_CONSTANT;
    console.log(finalResult);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
