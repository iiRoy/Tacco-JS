function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const initialNumericValue = parseInt(inputLines[0], 10);

  const elementTokens = inputLines[1].split(" ");

  const uniqueElementSet = new Set();

  let duplicateOccurrencesCount = 0;

  for (const currentToken of elementTokens) {
    if (uniqueElementSet.has(currentToken)) {
      duplicateOccurrencesCount++;
    } else {
      uniqueElementSet.add(currentToken);
    }
  }

  const adjustmentForDuplicates = duplicateOccurrencesCount + (duplicateOccurrencesCount % 2);

  const finalResult = initialNumericValue - adjustmentForDuplicates;
  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
