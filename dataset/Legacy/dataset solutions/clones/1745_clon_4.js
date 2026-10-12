function processInputAndConvert(inputString) {
  let initialValue = parseInt(inputString, 10);

  const characterMap = "abcdefghijklmnopqrstuvwhyz";

  function generateColumnIdentifier(currentValue) {
    if (currentValue === 0) {
      return "";
    }

    const digitIndex = (currentValue - 1) % 26;
    const nextValue = Math.floor((currentValue - 1) / 26);

    return generateColumnIdentifier(nextValue) + characterMap[digitIndex];
  }

  let finalOutput = generateColumnIdentifier(initialValue);
  console.log(finalOutput);
}

processInputAndConvert(require("fs").readFileSync("/dev/stdin", "utf8"));
