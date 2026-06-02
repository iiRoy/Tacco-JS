function processInputData(rawDataString) {
    const stringSegments = rawDataString.split(" ");
    const numericValues = stringSegments.map(segment => parseInt(segment, 10));

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    let finalResult;

    const performConditionalCalculation = (valA, valB) => {
        const remainderCheck = valB % valA;
        if (remainderCheck === 0) {
            return valB + valA;
        } else {
            return valB - valA;
        }
    };

    finalResult = performConditionalCalculation(firstOperand, secondOperand);
    
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
