const processInput = (inputData) => {
  const rawNumericString = inputData;
  let inputNum = parseInt(rawNumericString, 10);

  const BASE_VAL = 26;
  const charMap = "abcdefghijklmnopqrstuvwhyz";

  let outputString = "";

  const getCharacterByIndex = (value, characterSet) => {
    return characterSet.charAt(value - 1);
  };

  while (inputNum > 0) {
    let currentRemainder = inputNum % BASE_VAL;
    let valueToSubtractFromInput;

    if (currentRemainder === 0) {
      currentRemainder = BASE_VAL;
      valueToSubtractFromInput = BASE_VAL;
    } else {
      valueToSubtractFromInput = currentRemainder;
    }

    outputString = getCharacterByIndex(currentRemainder, charMap) + outputString;
    inputNum = (inputNum - valueToSubtractFromInput) / BASE_VAL;
  }

  console.log(outputString);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
