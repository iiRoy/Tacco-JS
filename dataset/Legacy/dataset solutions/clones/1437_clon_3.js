process.stdin.on("data", function(inputBuffer, strComponents) {
    const rawInputString = inputBuffer.toString();
    const trimmedInput = rawInputString.trim();
    strComponents = trimmedInput.split(" ");

    const firstOperandString = strComponents[0];
    const secondOperandString = strComponents[2];
    const combinedXString = firstOperandString + secondOperandString;

    const thirdOperandString = strComponents[1];
    const fourthOperandString = strComponents[3];
    const combinedYString = thirdOperandString + fourthOperandString;

    const squaredXComponent = combinedXString * combinedXString;
    const squaredYComponent = combinedYString * combinedYString;

    const sumOfSquaredComponents = squaredXComponent + squaredYComponent;
    const finalSquareRoot = Math.sqrt(sumOfSquaredComponents);

    const formattedResult = finalSquareRoot.toFixed(8);

    console.log(formattedResult);
}).resume();
