const processInputData = (rawData) => {
    const [firstVal, secondVal, thirdVal, fourthVal] = rawData.trim().split(' ').map(valStr => parseInt(valStr, 10));

    const conditionOne = (firstVal - thirdVal <= fourthVal);
    const conditionTwo = (firstVal - secondVal <= fourthVal);
    const conditionThree = (secondVal - thirdVal <= fourthVal);

    const finalDecision = conditionOne || (conditionTwo && conditionThree);

    const outputContent = finalDecision ? Math.abs(firstVal) : 'No';

    console.log(outputContent);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
