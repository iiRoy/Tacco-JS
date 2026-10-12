function readStandardInputSource() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processInputData(rawInputString) {
  const processedInputString = rawInputString.trim();
  const stringTokensArray = processedInputString.split(" ");

  const ZERO_VALUE_TO_FIND = 0; 

  let currentElementIndex = 0;
  for (const tokenString of stringTokensArray) {
    const convertedNumericValue = Number(tokenString);
    
    if (convertedNumericValue === ZERO_VALUE_TO_FIND) {
      console.log(currentElementIndex + 1);
    }
    currentElementIndex++;
  }
}

processInputData(readStandardInputSource());
