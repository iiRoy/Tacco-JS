const processInput = (sourceText) => {
    const numericStrings = sourceText.split(" ");
    
    const [firstNum, secondNum, thirdNum, limitVal] = numericStrings.map(Number);

    const differenceToLimit = limitVal - (firstNum + secondNum);
    const finalResult = firstNum - Math.max(0, differenceToLimit);

    console.log(finalResult);
};
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
