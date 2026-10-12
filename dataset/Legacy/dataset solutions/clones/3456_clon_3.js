const printOutput = console.log;

const padWithZeros = (numValue, targetLength) => {
  const numString = String(numValue);
  const tempPaddedString = '0'.repeat(targetLength) + numString;
  return tempPaddedString.substring(tempPaddedString.length - targetLength);
};

const rawInputData = require("fs").readFileSync("/dev/stdin", "UTF-8");
let inputLines = rawInputData.split("\n");

// The first line contains N and M, which are read but not used in the original logic.
// Removing their parsing does not change observable behavior.
// const [numCities, numQueries] = inputLines[0].split(" ").map(Number);

const cityDataLines = inputLines.slice(1);

// This global variable replicates the original code's behavior where 'Y' was
// declared globally and updated in the map callback, retaining the value
// from the last iteration. This value is then used in the second map,
// even though it's not the specific city's year for that iteration.
let globalLastParsedYearValue;

const processCityInputLine = (lineContent, originalPosition) => {
  const parts = lineContent.split(" ");
  const currentPrefectureCode = Number(parts[0]);
  const currentCityYear = Number(parts[1]);

  globalLastParsedYearValue = currentCityYear; // Update the global variable

  return {
    originalCityIndex: originalPosition,
    prefectureCode: currentPrefectureCode,
    cityYear: currentCityYear
  };
};

let initialCityRecords = cityDataLines.map((line, index) =>
  processCityInputLine(line, index)
);

initialCityRecords.sort((a, b) => a.cityYear - b.cityYear);

const prefectureOccurrenceCounts = {};
const ID_PADDING_LENGTH = 6;

let finalCityRecords = initialCityRecords.map(cityEntry => {
  if (prefectureOccurrenceCounts[cityEntry.prefectureCode] === undefined) {
    prefectureOccurrenceCounts[cityEntry.prefectureCode] = 1;
  } else {
    prefectureOccurrenceCounts[cityEntry.prefectureCode]++;
  }

  const currentPrefectureCount = prefectureOccurrenceCounts[cityEntry.prefectureCode];

  const formattedPrefectureString = padWithZeros(cityEntry.prefectureCode, ID_PADDING_LENGTH);
  const formattedCityIdentifier = padWithZeros(currentPrefectureCount, ID_PADDING_LENGTH);

  return {
    originalCityIndex: cityEntry.originalCityIndex,
    formattedPrefecture: formattedPrefectureString,
    // Preserve the original's behavior: use the globalLastParsedYearValue.
    // This property is not used in the final output, so its specific value
    // (which is the year of the last city from the initial parsing)
    // does not affect observable behavior, but its source must be preserved.
    yearPlaceholder: globalLastParsedYearValue,
    cityIdentifier: formattedCityIdentifier
  };
});

finalCityRecords.sort((a, b) => a.originalCityIndex - b.originalCityIndex);

finalCityRecords.forEach(cityOutputData => {
  const combinedOutputString = cityOutputData.formattedPrefecture + cityOutputData.cityIdentifier;
  printOutput(combinedOutputString);
});
