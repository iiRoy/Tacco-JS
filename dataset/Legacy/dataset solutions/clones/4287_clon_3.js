function getInputData(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function displayResult(message){console.log(message);}
function logError(message){console.error(message);}

function transformInput(dataStr, conversionType){
  const conversionStrategies = {
    0: (s) => s,
    1: (s) => parseInt(s, 10),
    2: (s) => s.split(" "),
    3: (s) => s.split("\n"),
    4: (s) => s.split(" ").map((item) => Number(item)),
    5: (s) => s.split("\n").map((item) => Number(item)),
    6: (s) => s.split(""),
    7: (s) => s.split("").map((item) => Number(item)),
  };

  const strategy = conversionStrategies[conversionType];
  if (strategy) {
    return strategy(dataStr);
  }
  return undefined;
}

function processData(rawData) {
  const processedLines = transformInput(rawData, 3);
  const countN = transformInput(processedLines[0], 1);
  const numberList = transformInput(processedLines[1], 4);

  const baseValue = 3;
  const totalCombinations = Math.pow(baseValue, countN);

  const isEven = (num) => num % 2 === 0;

  const evenCountProduct = numberList.reduce((accumulator, currentNumber) => {
    if (isEven(currentNumber)) {
      return accumulator * 2;
    }
    return accumulator;
  }, 1);

  displayResult(totalCombinations - evenCountProduct);
}

processData(getInputData());
