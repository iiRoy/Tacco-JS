function processInput(rawData) {
  let charArray = rawData.split("");

  const firstChar = charArray[0];

  charArray.splice(0, 1);

  const stringAfterFirstCharRemoved = rawData.replace(firstChar, '');
  const firstSearchIndex = stringAfterFirstCharRemoved.search(firstChar);
  charArray.splice(firstSearchIndex, 1);

  const stringAfterSecondCharRemoved = stringAfterFirstCharRemoved.replace(firstChar, '');
  const secondSearchIndex = stringAfterSecondCharRemoved.search(firstChar);
  charArray.splice(secondSearchIndex, 1);

  const areFirstTwoRemainingCharsEqual = (charArray[0] === charArray[1]);

  if (areFirstTwoRemainingCharsEqual) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
