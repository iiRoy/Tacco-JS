function processInputData(rawDataString) {
  const divisionFactor = 3;

  const parseInputValues = (dataString) => {
    const trimmedContent = dataString.trim();
    const stringParts = trimmedContent.split(' ');
    const firstParsed = parseInt(stringParts[0], 10);
    const secondParsed = parseInt(stringParts[1], 10); // This value is parsed but not used in the final calculation
    return { primaryValue: firstParsed, secondaryValue: secondParsed };
  };

  const { primaryValue: numeratorValue, secondaryValue: auxiliaryValue } = parseInputValues(rawDataString);

  const calculatedResult = numeratorValue / divisionFactor;

  console.log(calculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
