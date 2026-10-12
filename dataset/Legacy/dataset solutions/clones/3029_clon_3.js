var processInput = rawInputString => {
  const parseNumericString = (strValue) => {
    return parseInt(strValue, 10);
  };

  const inputParts = rawInputString.split(" ");
  const numericValues = inputParts.map(parseNumericString);

  const valA = numericValues[0];
  const valB = numericValues[1];
  const valC = numericValues[2];

  const minimumOfAandB = Math.min(valA, valB);
  const maximumOfAandB = Math.max(valA, valB);

  let finalOutputMessage;

  if (valC > minimumOfAandB && valC < maximumOfAandB) {
    finalOutputMessage = "Yes";
  } else {
    finalOutputMessage = "No";
  }

  console.log(finalOutputMessage);
};

processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));
