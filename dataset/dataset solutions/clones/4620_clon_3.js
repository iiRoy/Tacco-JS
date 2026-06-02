const getFirstCharAsUppercase = (textPart) => {
  return textPart.charAt(0).toUpperCase();
};

function processRawInput(inputContent) {
  const cleanedInput = inputContent.trim();
  const wordSegments = cleanedInput.split(" ");

  const [wordA, wordB, wordC] = wordSegments;

  const initialA = getFirstCharAsUppercase(wordA);
  const initialB = getFirstCharAsUppercase(wordB);
  const initialC = getFirstCharAsUppercase(wordC);

  const finalResultString = initialA + initialB + initialC;
  console.log(finalResultString);
}

processRawInput(require("fs").readFileSync("/dev/stdin", "utf8"));
