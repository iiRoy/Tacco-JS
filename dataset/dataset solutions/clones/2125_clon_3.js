function processInputData(rawData) {
  const parsedLines = rawData.split("\n");

  const stringLength = Number(parsedLines[0]);
  const initialString = parsedLines[1];
  const numQueries = Number(parsedLines[2]);

  const queryDataStartLine = 3;

  let charArray = Array.from(initialString);

  const queryInstructions = parsedLines.slice(queryDataStartLine, queryDataStartLine + numQueries);

  const parseQueryLine = (lineContent) => {
    const parts = lineContent.split(" ");
    return {
      queryKind: Number(parts[0]),
      firstParam: Number(parts[1]),
      secondParam: parts[2]
    };
  };

  queryInstructions.forEach(currentQueryLine => {
    const queryDetails = parseQueryLine(currentQueryLine);
    const queryKind = queryDetails.queryKind;

    switch (queryKind) {
      case 1:
        const updateTargetIndex = queryDetails.firstParam;
        const newCharacterValue = queryDetails.secondParam;
        const zeroBasedUpdatePosition = updateTargetIndex - 1;

        if (charArray[zeroBasedUpdatePosition] !== newCharacterValue) {
          charArray[zeroBasedUpdatePosition] = newCharacterValue;
        }
        break;

      case 2:
        const rangeStartOneBased = queryDetails.firstParam;
        const rangeEndOneBased = Number(queryDetails.secondParam);

        const uniqueCharactersTracker = {};
        let distinctCharacterCount = 0;

        const isRangeInitiallyValid = (rangeStartOneBased <= rangeEndOneBased) && (rangeStartOneBased < stringLength);

        if (isRangeInitiallyValid) {
          for (let currentOneBasedPosition = rangeStartOneBased; currentOneBasedPosition <= rangeEndOneBased; currentOneBasedPosition++) {
            const zeroBasedPosition = currentOneBasedPosition - 1;
            const characterAtPosition = charArray[zeroBasedPosition];

            if (uniqueCharactersTracker[characterAtPosition] === undefined) {
              uniqueCharactersTracker[characterAtPosition] = true;
              distinctCharacterCount++;
            }
          }
        }
        console.log(distinctCharacterCount + "\n");
        break;

      default:
        break;
    }
  });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
