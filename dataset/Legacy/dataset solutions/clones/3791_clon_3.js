function ProcessInput(rawData) {
  const NEWLINE_DELIMITER = "\n";

  const trimmedData = rawData.trim();
  const lines = trimmedData.split(NEWLINE_DELIMITER);

  const countVal = parseInt(lines[0], 10);
  const targetString = lines[1];

  const resultsArray = [];

  const getUniqueElements = (sourceArray) => {
    return sourceArray.filter((element, index, self) => self.indexOf(element) === index);
  };

  for (let idx = 1; idx < countVal; idx++) {
    const segmentOne = targetString.substring(0, idx);
    const charsSegmentOne = segmentOne.split('');
    const uniqueCharsOne = getUniqueElements(charsSegmentOne);

    const segmentTwo = targetString.substring(idx, countVal);
    const charsSegmentTwo = segmentTwo.split('');
    const uniqueCharsTwo = getUniqueElements(charsSegmentTwo);

    const intersectionChars = uniqueCharsOne.filter(charItem => uniqueCharsTwo.includes(charItem));

    resultsArray.push(intersectionChars.length);
  }

  console.log(Math.max(...resultsArray));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
