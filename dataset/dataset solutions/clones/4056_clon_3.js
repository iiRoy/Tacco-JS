function CalculateMaximumSweetness(rawDataContent) {
  const convertToNumber = (strValue, defaultValue = 0) => {
    const parsed = Number(strValue);
    if (!Number.isFinite(parsed)) {
      console.warn(`Warning: Invalid number encountered '${strValue}'. Using default value ${defaultValue}.`);
      return defaultValue;
    }
    return parsed;
  };

  const configurationLines = rawDataContent.trim().split('\n');

  if (configurationLines.length < 3) {
    console.error("Error: Insufficient input data. Expected at least 3 lines.");
    return -1;
  }

  const numberOfColumns = convertToNumber(configurationLines[0]);

  if (numberOfColumns <= 0) {
    console.error(`Error: Number of columns must be a positive integer. Received: ${numberOfColumns}`);
    return -1;
  }

  const firstRowStringValues = configurationLines[1].split(' ').filter(Boolean);
  const secondRowStringValues = configurationLines[2].split(' ').filter(Boolean);

  if (firstRowStringValues.length !== numberOfColumns || secondRowStringValues.length !== numberOfColumns) {
    console.error(`Error: Mismatch in array lengths. Expected ${numberOfColumns} elements per row, but got ${firstRowStringValues.length} for first row and ${secondRowStringValues.length} for second row.`);
    return -1;
  }

  const firstRowNumericValues = firstRowStringValues.map(val => convertToNumber(val));
  const secondRowNumericValues = secondRowStringValues.map(val => convertToNumber(val));

  let overallMaximumSweetness = Number.MIN_SAFE_INTEGER;

  const firstRowPrefixSums = new Array(numberOfColumns);
  firstRowPrefixSums[0] = firstRowNumericValues[0];
  for (let k = 1; k < numberOfColumns; k++) {
    firstRowPrefixSums[k] = firstRowPrefixSums[k - 1] + firstRowNumericValues[k];
  }

  const secondRowSuffixSums = new Array(numberOfColumns);
  secondRowSuffixSums[numberOfColumns - 1] = secondRowNumericValues[numberOfColumns - 1];
  for (let k = numberOfColumns - 2; k >= 0; k--) {
    secondRowSuffixSums[k] = secondRowSuffixSums[k + 1] + secondRowNumericValues[k];
  }

  for (let turningPointColumn = 0; turningPointColumn < numberOfColumns; turningPointColumn++) {
    const currentPathTotalSweetness = firstRowPrefixSums[turningPointColumn] + secondRowSuffixSums[turningPointColumn];

    if (currentPathTotalSweetness > overallMaximumSweetness) {
      overallMaximumSweetness = currentPathTotalSweetness;
    }
  }

  return overallMaximumSweetness;
}

try {
  const fileSystemModule = require("fs");
  const inputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  const finalResult = CalculateMaximumSweetness(inputData);

  if (finalResult !== -1) {
    console.log(finalResult);
  }
} catch (ioError) {
  console.error("An error occurred during file input/output:", ioError.message);
}