function processData(inputContent) {
  inputContent = inputContent.split("\n");
  const limitVal = parseInt(inputContent[0], 10);
  const binaryString = inputContent[1];

  Array.from({ length: limitVal }).forEach((_, idx) => {
    const charArray = Array.from(binaryString);
    charArray[idx] = (binaryString[idx] === "1" ? "0" : "1");
    const modifiedBinary = charArray.join("");
    console.log(calculateReductionSteps(Number.parseInt(modifiedBinary, 2)));
  });
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));

function getDecimalDigitCount(val) {
  if (val === 0) {
    return 1;
  }
  return Math.floor(Math.log10(val)) + 1;
}

function calculateReductionSteps(initialNum) {
  let stepCounter = 0;
  let currentNum = initialNum;

  while (currentNum !== 0) {
    stepCounter++;
    const divisor = getDecimalDigitCount(currentNum);
    currentNum %= divisor;
  }
  return stepCounter;
}
