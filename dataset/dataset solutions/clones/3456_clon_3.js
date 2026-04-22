const outputPrinter = console.log;

const padSixDigits = (numVal) => {
  if (typeof numVal !== 'number' && typeof numVal !== 'string') {
    numVal = String(numVal);
  }
  return String(numVal).padStart(6, '0');
};

const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "UTF-8");

if (!rawInputBuffer || rawInputBuffer.trim().length === 0) {
    outputPrinter("Error: Empty input received.");
    process.exit(1);
}

const allInputLines = rawInputBuffer.split("\n");

const configLineParts = allInputLines[0].split(" ");
const totalMunicipalities = parseInt(configLineParts[0], 10);
const numCitiesToProcess = parseInt(configLineParts[1], 10);

const municipalityRawData = allInputLines.slice(1);

if (municipalityRawData.length < numCitiesToProcess) {
    console.error(`Warning: Expected ${numCitiesToProcess} cities, but found only ${municipalityRawData.length}.`);
}

const cityInformationCollection = municipalityRawData.map((recordEntry, entryIndex) => {
  if (!recordEntry || recordEntry.trim().length === 0) {
      console.warn(`Skipping empty or invalid record at index ${entryIndex}`);
      return null;
  }

  const parts = recordEntry.split(" ");
  const currentPrefectureCode = parseInt(parts[0], 10);
  const foundingYear = parseInt(parts[1], 10);

  if (isNaN(currentPrefectureCode) || isNaN(foundingYear)) {
      console.warn(`Invalid number format in record at index ${entryIndex}: ${recordEntry}. Skipping.`);
      return null;
  }

  return {
    originalInsertionIndex: entryIndex,
    administrativeUnit: currentPrefectureCode,
    establishmentYear: foundingYear
  };
}).filter(Boolean);

cityInformationCollection.sort((entityA, entityB) => {
  return entityA.establishmentYear - entityB.establishmentYear;
});

const prefectureSequenceTracker = new Map();

const processedMunicipalities = cityInformationCollection.map(currentMunicipality => {
  const currentPrefCode = currentMunicipality.administrativeUnit;

  let sequenceNumber = prefectureSequenceTracker.get(currentPrefCode) || 0;
  sequenceNumber++;
  prefectureSequenceTracker.set(currentPrefCode, sequenceNumber);

  const paddedPrefecture = padSixDigits(currentPrefCode);
  const paddedIdentifier = padSixDigits(sequenceNumber);

  return {
    originalInsertionIndex: currentMunicipality.originalInsertionIndex,
    formattedPrefectureCode: paddedPrefecture,
    uniqueCityIdentifier: paddedIdentifier
  };
});

processedMunicipalities.sort((entityA, entityB) => {
  return entityA.originalInsertionIndex - entityB.originalInsertionIndex;
});

for (const finalCityData of processedMunicipalities) {
  outputPrinter(finalCityData.formattedPrefectureCode + finalCityData.uniqueCityIdentifier);
}