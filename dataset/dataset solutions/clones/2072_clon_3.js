function processInputData(rawData) {
  const LINE_SEPARATOR = "\n";
  const VALUE_SEPARATOR = " ";

  const firstInputLine = rawData.split(LINE_SEPARATOR)[0];

  const dimensionStringParts = firstInputLine.split(VALUE_SEPARATOR);
  const numericDimensions = dimensionStringParts.map(str => parseInt(str, 10));

  const heightVal = numericDimensions[0];
  const widthVal = numericDimensions[1];

  let finalCalculatedValue;

  if (heightVal === 1 || widthVal === 1) {
    finalCalculatedValue = 1;
  } else {
    const totalGridCells = heightVal * widthVal;
    finalCalculatedValue = (totalGridCells + 1) / 2;
  }

  console.log(finalCalculatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
