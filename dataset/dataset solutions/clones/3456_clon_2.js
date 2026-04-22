outputLog = console.log;

const inputDataSource = require("node:fs").readFileSync(
  "/dev/stdin",
  "UTF-8"
);
let dataRows = inputDataSource.split("\n");

const totalItems = Number(dataRows[0].split(" ")[0]);
const queryCount = Number(dataRows[0].split(" ")[1]);

dataRows = dataRows.slice(1); // Using slice instead of splice for clarity and slight difference

let municipalityRecords = dataRows.map((rowData, initialPos) => {
  const regionIdentifier = Number(rowData.split(" ")[0]);
  const establishmentYear = Number(rowData.split(" ")[1]);

  return {
    originalPosition: initialPos,
    regionCode: regionIdentifier,
    foundingYear: establishmentYear,
  };
});

municipalityRecords.sort((recordOne, recordTwo) => {
  return recordOne.foundingYear - recordTwo.foundingYear;
});

const regionOccurrences = [];

municipalityRecords = municipalityRecords.map((currentMunicipality) => {
  if (regionOccurrences[currentMunicipality.regionCode] === undefined) {
    regionOccurrences[currentMunicipality.regionCode] = 1;
  } else {
    regionOccurrences[currentMunicipality.regionCode] += 1;
  }

  let formattedRegion = "000000" + currentMunicipality.regionCode.toString();
  formattedRegion = formattedRegion.slice(-6); // Using slice for difference

  let formattedIdentifier = "000000" + regionOccurrences[currentMunicipality.regionCode].toString();
  formattedIdentifier = formattedIdentifier.slice(-6);

  return {
    originalPosition: currentMunicipality.originalPosition,
    finalPrefectureCode: formattedRegion,
    creationYear: currentMunicipality.foundingYear, // Renamed property
    uniqueIdentifier: formattedIdentifier,
  };
});

municipalityRecords.sort((itemA, itemB) => {
  return itemA.originalPosition - itemB.originalPosition;
});

municipalityRecords.forEach((finalEntry) =>
  outputLog(
    finalEntry.finalPrefectureCode.toString() +
    finalEntry.uniqueIdentifier.toString()
  )
);