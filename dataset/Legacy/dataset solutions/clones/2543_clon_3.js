function toggleBinaryValue(val) {
  return 1 - val;
}

function processInputAndGenerateGrid(inputData) {
  const firstLineOfInput = inputData.split("\n")[0];
  const stringParameters = firstLineOfInput.split(" ");
  const numericParameters = stringParameters.map((strVal) => Number(strVal));

  console.log(numericParameters);

  const gridHeight = numericParameters[0];
  const gridWidth = numericParameters[1];
  const splitPointA = numericParameters[2];
  const splitPointB = numericParameters[3];

  const generateIndexSequence = (count) => Array.from({ length: count }, (_, index) => index);

  const rowBaseValues = generateIndexSequence(gridHeight).map((rowIndex) => {
    return rowIndex < splitPointB ? 0 : 1;
  });

  const finalGridStructure = rowBaseValues.map((currentBaseValue) => {
    return generateIndexSequence(gridWidth).map((colIndex) => {
      return colIndex < splitPointA ? currentBaseValue : toggleBinaryValue(currentBaseValue);
    });
  });

  const stringifiedRows = finalGridStructure.map((rowArray) => rowArray.join(""));
  const finalOutputContent = stringifiedRows.join("\n") + "\n";

  console.log(finalOutputContent);
}

processInputAndGenerateGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
