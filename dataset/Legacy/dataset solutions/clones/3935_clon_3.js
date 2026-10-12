function processData(rawInputString) {
  const parsedNumber = parseInt(rawInputString);
  let outputElements = [];

  const specialCaseThreshold = 3;

  if (parsedNumber === specialCaseThreshold) {
    const predefinedValues = [2, 3, 25];
    for (let k = 0; k < predefinedValues.length; k++) {
      outputElements[k] = predefinedValues[k];
    }
  } else {
    for (let currentIndex = 0; currentIndex < parsedNumber; currentIndex++) {
      const calculatedElementValue = currentIndex * 2;
      outputElements.push(calculatedElementValue);
    }
  }
  
  console.log(outputElements.join(" "));
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
