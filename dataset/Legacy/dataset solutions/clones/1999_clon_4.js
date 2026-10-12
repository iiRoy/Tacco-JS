function processInput(rawText) {
  const parsedDigits = Array.from(rawText, (char) => parseInt(char, 10));

  const [firstElement, secondElement, thirdElement] = parsedDigits;

  const resultA = thirdElement;
  const resultB = firstElement;
  const resultC = secondElement;

  console.log('%d', resultA, resultB, resultC);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
