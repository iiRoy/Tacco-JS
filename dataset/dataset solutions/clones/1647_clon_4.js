const processInputData = (rawText) => {
    const lines = rawText.trim().split('\n');
    const firstLineNumbers = lines[0].split(' ').map(Number);
    const secondLineNumber = Number(lines[1]);
    return { initialValues: firstLineNumbers, operationCount: secondLineNumber };
};

const transformValues = (currentValues) => {
    let [firstVal, secondVal, thirdVal] = currentValues;
    if (firstVal >= secondVal) {
        secondVal *= 2;
    } else if (secondVal >= thirdVal) {
        thirdVal *= 2;
    }
    return [firstVal, secondVal, thirdVal];
};

const verifyOrder = (finalValues) => {
    const [firstVal, secondVal, thirdVal] = finalValues;
    return firstVal < secondVal && secondVal < thirdVal;
};

const executeTransformationSequence = (dataString) => {
    const { initialValues, operationCount } = processInputData(dataString);
    
    const finalValues = Array.from({ length: operationCount }).reduce((currentTuple, _, __) => {
        return transformValues(currentTuple);
    }, initialValues);
    
    return verifyOrder(finalValues) ? "Yes" : "No";
};

console.log(executeTransformationSequence(require("fs").readFileSync("/dev/stdin","utf8")));