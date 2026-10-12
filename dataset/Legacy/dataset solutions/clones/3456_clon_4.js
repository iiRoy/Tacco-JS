const printToConsole = console.log;

const fileSystem = require("fs");
const inputBuffer = fileSystem.readFileSync("/dev/stdin", "UTF-8");

const inputRecords = inputBuffer.split("\n");

const [totalCities, totalPrefectures] = inputRecords[0].split(" ").map(Number);

const cityRawData = inputRecords.slice(1);

const prefectureGroupings = new Map();

cityRawData.forEach((recordLine, idx) => {
  const [prefStr, yearStr] = recordLine.split(" ");
  const prefNum = Number(prefStr);
  const yearVal = Number(yearStr);

  if (!prefectureGroupings.has(prefNum)) {
    prefectureGroupings.set(prefNum, []);
  }
  prefectureGroupings.get(prefNum).push({
    initialPosition: idx,
    eventYear: yearVal,
  });
});

const processedCityData = [];

for (const [prefKey, cityList] of prefectureGroupings.entries()) {
  cityList.sort((a, b) => a.eventYear - b.eventYear);

  let sequenceCounter = 1;
  const formattedPrefCode = String(prefKey).padStart(6, "0");

  for (const cityEntry of cityList) {
    const formattedSequenceId = String(sequenceCounter).padStart(6, "0");

    processedCityData.push({
      initialPosition: cityEntry.initialPosition,
      finalPrefCode: formattedPrefCode,
      finalSequenceId: formattedSequenceId,
    });
    sequenceCounter++;
  }
}

processedCityData.sort((a, b) => a.initialPosition - b.initialPosition);

processedCityData.forEach((cityOutput) =>
  printToConsole(cityOutput.finalPrefCode + cityOutput.finalSequenceId)
);
