const processInput = rawData => {
  const trimmedData = rawData.trim();
  const parsedLines = trimmedData.split('\n');

  const configLine = parsedLines[0];
  const [firstSegmentStr, secondSegmentStr] = configLine.split(' ');

  const firstSegmentLength = Number(firstSegmentStr);
  const secondSegmentLength = Number(secondSegmentStr);

  const targetString = parsedLines[1];

  const hyphenChar = '-';
  const digitPatternChar = '\\d';
  const regexPatternString = `${digitPatternChar}{${firstSegmentLength}}${hyphenChar}${digitPatternChar}{${secondSegmentLength}}`;
  const validationRegex = new RegExp(regexPatternString, 'g');

  const isMatchFound = validationRegex.test(targetString);

  if (isMatchFound) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
