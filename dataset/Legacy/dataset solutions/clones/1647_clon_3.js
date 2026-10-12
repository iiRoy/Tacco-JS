function processInput(rawData) {
  rawData = rawData.trim();

  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  const inputLines = rawData.split(NEWLINE_DELIMITER);
  const firstLineContent = inputLines[0];
  const secondLineContent = inputLines[1];

  const firstLineParts = firstLineContent.split(SPACE_DELIMITER);

  const parseNumericValue = (str) => parseInt(str, 10);

  let redComponent = parseNumericValue(firstLineParts[0]);
  let greenComponent = parseNumericValue(firstLineParts[1]);
  let blueComponent = parseNumericValue(firstLineParts[2]);
  let operationCount = parseNumericValue(secondLineContent);

  const checkColorOrder = () => {
    const isRedLessThanGreen = redComponent < greenComponent;
    const isGreenLessThanBlue = greenComponent < blueComponent;
    return isRedLessThanGreen && isGreenLessThanBlue;
  };

  const performColorAdjustment = () => {
    if (redComponent >= greenComponent) {
      const doubledGreen = greenComponent * 2;
      greenComponent = doubledGreen;
    } else if (greenComponent >= blueComponent) {
      const doubledBlue = blueComponent * 2;
      blueComponent = doubledBlue;
    }
  };

  for (let opIndex = 0; opIndex < operationCount; opIndex++) {
    performColorAdjustment();
  }

  const finalVerdict = checkColorOrder() ? "Yes" : "No";

  console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
