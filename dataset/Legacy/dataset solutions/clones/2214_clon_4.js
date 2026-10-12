function processInputData(sourceText) {
  const numStrings = sourceText.split(" ");
  const firstVal = Number(numStrings[0]);
  const secondVal = Number(numStrings[1]);

  const repeatedCharacter = firstVal < secondVal ? String(firstVal) : String(secondVal);
  const repetitionCount = firstVal < secondVal ? secondVal : firstVal;

  const finalResult = repeatedCharacter.repeat(repetitionCount);
  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
