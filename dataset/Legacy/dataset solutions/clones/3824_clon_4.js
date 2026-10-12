const processInputData = (rawData) => {
    const stringComponents = rawData.trim().split(' ');
    return stringComponents.map(component => Number(component));
};

const evaluateCondition = (numericElements) => {
    const [firstOperand, secondOperand, thirdOperand, fourthOperand] = numericElements;
    
    // The original condition: (Math.abs(a-b <=d)) || (Math.abs(a-b <=d) && Math.abs(b-c <=d))
    // In JavaScript, Math.abs(true) is 1, Math.abs(false) is 0.
    // So, Math.abs(X <= Y) acts as a boolean check for (X <= Y).
    // The expression simplifies to: (firstOperand - secondOperand <= fourthOperand)
    // We must replicate the exact observable behavior, not a corrected interpretation.
    const outcomeFlag = firstOperand - secondOperand <= fourthOperand;
    
    return outcomeFlag ? 'Yes' : 'No';
};

const runApplication = (fileSystemModule) => {
    const fileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const processedNumbers = processInputData(fileContent);
    const finalDecision = evaluateCondition(processedNumbers);
    console.log(finalDecision);
};

runApplication(require("fs"));
