const processInputAndCompute = (textualData) => {
  const sanitizedText = textualData.replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '');
  
  const numericInputVal = parseFloat(sanitizedText);
  
  const intermediateCalculation = 25 - numericInputVal;
  const finalResult = intermediateCalculation + 23;
  
  return finalResult;
};

const acquiredContent = require("fs").readFileSync("/dev/stdin", "utf8");
const computedValue = processInputAndCompute(acquiredContent);

console.log(computedValue);