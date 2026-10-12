function processInput(inputString) {
  const processedText = inputString.trim();
  const textLength = processedText.length;

  const firstAndLastAreSame = processedText[0] === processedText[textLength - 1];
  const isLengthAnOddNumber = (textLength % 2 !== 0);

  const outcomeLookup = {
    "false-false": "Second", // Even length, ends not equal
    "false-true": "First",  // Even length, ends equal
    "true-false": "First",   // Odd length, ends not equal
    "true-true": "Second"    // Odd length, ends equal
  };

  const decisionKey = `${isLengthAnOddNumber}-${firstAndLastAreSame}`;
  console.log(outcomeLookup[decisionKey]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
