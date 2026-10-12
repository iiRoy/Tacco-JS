function processInputData(rawInput) {
  const RADIX_DECIMAL = 10;
  const QUERY_TYPE_UPDATE_CHAR = 1;
  const QUERY_TYPE_COUNT_UNIQUE_CHARS = 2;
  const INPUT_LINE_INDEX_N = 0;
  const INPUT_LINE_INDEX_S = 1;
  const INPUT_LINE_INDEX_Q = 2;
  const QUERY_LINES_START_OFFSET = 3;

  const parseIntegerWithRadix = (str) => parseInt(str, RADIX_DECIMAL);

  const inputLines = rawInput.split("\n");

  const stringLength = parseIntegerWithRadix(inputLines[INPUT_LINE_INDEX_N]);
  const initialStringContent = inputLines[INPUT_LINE_INDEX_S];
  const totalQueries = parseIntegerWithRadix(inputLines[INPUT_LINE_INDEX_Q]);

  const characterArray = initialStringContent.split('');

  const queryLineStrings = inputLines.slice(QUERY_LINES_START_OFFSET, QUERY_LINES_START_OFFSET + totalQueries);

  const executeSingleQuery = (queryText, charDataArray) => {
    const queryComponents = queryText.split(" ");
    const operationKind = parseIntegerWithRadix(queryComponents[0]);

    switch (operationKind) {
      case QUERY_TYPE_UPDATE_CHAR:
        const targetIndexOneBased = parseIntegerWithRadix(queryComponents[1]);
        const newCharacterValue = queryComponents[2];
        const zeroBasedIndex = targetIndexOneBased - 1;

        const currentCharacter = charDataArray[zeroBasedIndex];
        if (currentCharacter !== newCharacterValue) {
          charDataArray[zeroBasedIndex] = newCharacterValue;
        }
        break;

      case QUERY_TYPE_COUNT_UNIQUE_CHARS:
        const rangeStartOneBased = parseIntegerWithRadix(queryComponents[1]);
        const rangeEndOneBased = parseIntegerWithRadix(queryComponents[2]);

        const uniqueCharacterSet = new Set();
        for (let currentPosition = rangeStartOneBased; currentPosition <= rangeEndOneBased; currentPosition++) {
          const charToEvaluate = charDataArray[currentPosition - 1];
          uniqueCharacterSet.add(charToEvaluate);
        }
        console.log(uniqueCharacterSet.size);
        break;
    }
  };

  for (const currentQueryString of queryLineStrings) {
    executeSingleQuery(currentQueryString, characterArray);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
