function processData(rawInputData) {
  const inputCharacterList = Array.from(String(rawInputData));
  const lastIndexPosition = inputCharacterList.length - 1;
  const finalCharacter = inputCharacterList[lastIndexPosition];

  let outputMessage = '';

  const honSuffixDigits = new Set(["2", "4", "5", "7", "9"]);
  const ponSuffixDigits = new Set(["0", "1", "6", "8"]);

  if (honSuffixDigits.has(finalCharacter)) {
    outputMessage = "hon";
  } else if (ponSuffixDigits.has(finalCharacter)) {
    outputMessage = "pon";
  } else {
    outputMessage = "bon";
  }

  console.log(outputMessage);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
