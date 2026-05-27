function processInputData(inputString) {
  const numericValues = inputString.split(" ").map(Number);
  
  const distinctElements = new Set(numericValues);
  
  const outputResult = distinctElements.size === 1 ? "Yes" : "No";
  
  console.log(outputResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
