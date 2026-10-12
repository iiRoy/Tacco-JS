function processInputData(rawDataString) {
  const inputLines = rawDataString.split("\n");
  const numericStringParts = inputLines[0].split(" ");

  const convertStringsToNumbers = (stringArray) => {
    const parsedNumbers = [];
    for (let i = 0; i < stringArray.length; i++) {
      parsedNumbers.push(Number.parseInt(stringArray[i]));
    }
    return parsedNumbers;
  };

  const [widthDimension, heightDimension, xCoordinate, yCoordinate] = convertStringsToNumbers(numericStringParts);

  const halfWidth = widthDimension / 2;
  const halfHeight = heightDimension / 2;

  const quadrantArea = halfWidth * halfHeight;

  const IS_AT_CENTER = 1;
  const NOT_AT_CENTER = 0;

  let centerPointIndicator;

  if (xCoordinate === halfWidth && yCoordinate === halfHeight) {
    centerPointIndicator = IS_AT_CENTER;
  } else {
    centerPointIndicator = NOT_AT_CENTER;
  }

  console.log(quadrantArea, centerPointIndicator);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
