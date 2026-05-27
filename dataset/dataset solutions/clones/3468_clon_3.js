function HandleInput(inputString) {
  const processAndReverseString = (sourceStr) => {
    const lowercasedString = sourceStr.toLowerCase();
    const characterArray = lowercasedString.split("");
    const reversedArray = characterArray.reverse();
    const finalProcessedString = reversedArray.join("");
    return finalProcessedString;
  };

  const stringLength = inputString.length;
  let outputResult = '';

  const isLengthPermitted = (stringLength === 2 || stringLength === 3);

  if (isLengthPermitted) {
    if (stringLength === 2) {
      outputResult = inputString;
    } else if (stringLength === 3) {
      outputResult = processAndReverseString(inputString);
    }
    console.log(outputResult);
  }
}

HandleInput(require("fs").readFileSync("/dev/stdin", "utf8"));
