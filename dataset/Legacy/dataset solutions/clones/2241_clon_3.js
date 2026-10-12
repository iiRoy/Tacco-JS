const _splitAndMapToNumbers = (str, separator) => str.split(separator).map(Number);
const _splitAndJoin = (arr, separator) => arr.join(separator);

function processInputString(dataStr, conversionType) {
  const conversionHandlers = {
    1: (s) => parseInt(s),
    2: (s) => s.split(" "),
    3: (s) => s.split("\n"),
    4: (s) => _splitAndMapToNumbers(s, " "),
    5: (s) => _splitAndMapToNumbers(s, "\n"),
    6: (s) => s.split(""),
    7: (s) => _splitAndMapToNumbers(s, ""),
    8: (arr) => _splitAndJoin(arr, " "),
    9: (arr) => _splitAndJoin(arr, "\n"),
    0: (arr) => _splitAndJoin(arr, ""),
  };

  const handler = conversionHandlers[conversionType];
  return handler ? handler(dataStr) : dataStr;
}

function executeProgram(rawInputStr) {
  const parsedInputArray = processInputString(rawInputStr, 4);
  const countN = parsedInputArray[0];
  const limitK = parsedInputArray[1];
  const valueS = parsedInputArray[2];

  const defaultValueForRemaining = 1;

  const resultArray = Array.from({ length: countN }, (_, index) => {
    return index < limitK ? valueS : defaultValueForRemaining;
  });

  displayOutput(resultArray.join(" "));
}

function getInputData(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(content){
  console.log(content);
}

function logError(errContent){
  console.error(errContent);
}

executeProgram(getInputData());
