executeMainLogic(getInputContent());

function getInputContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(content) {
  console.log(content);
}

function logError(message) {
  console.error(message);
}

function processInputData(dataItem, conversionType) {
  const conversionHandlers = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    3: (val) => val.split("\n"),
    4: (val) => val.split(" ").map((item) => Number(item)),
    5: (val) => val.split("\n").map((item) => Number(item)),
    6: (val) => val.split(""),
    7: (val) => val.split("").map((item) => Number(item)),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
    default: (val) => val,
  };

  const handler = conversionHandlers[conversionType] || conversionHandlers.default;
  return handler(dataItem);
}

function executeMainLogic(rawInputString) {
  const processedInputLines = processInputData(rawInputString, 3);
  const inputLength = processInputData(processedInputLines[0], 1);
  const firstString = processedInputLines[1];
  const secondString = processedInputLines[2];

  const areStringsIdentical = firstString === secondString;

  if (areStringsIdentical) {
    displayOutput(inputLength);
  } else {
    for (let loopIndex = 1; loopIndex <= inputLength; loopIndex++) {
      const suffixOfFirst = firstString.slice(loopIndex);
      const prefixOfSecond = secondString.slice(0, inputLength - loopIndex);

      logError(suffixOfFirst + " " + prefixOfSecond);

      const isOverlapMatch = suffixOfFirst === prefixOfSecond;

      if (isOverlapMatch) {
        const calculatedResult = inputLength + loopIndex;
        displayOutput(calculatedResult);
        return;
      }
    }
    displayOutput(tmp.length);
  }
}
