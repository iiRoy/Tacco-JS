const outputPrinter = console.log;

const fileContent = require("fs").readFileSync("/dev/stdin", "UTF-8");
const allInputLines = fileContent.split("\n");

const headerInfo = allInputLines[0].split(" ");
const totalCities = Number(headerInfo[0]);
const totalPrefectures = Number(headerInfo[1]);

const cityRecords = [];
for (let j = 1; j <= totalCities; ++j) {
    const currentLine = allInputLines[j];
    if (!currentLine) continue;

    const parts = currentLine.split(" ");
    const currentPrefId = Number(parts[0]);
    const currentEventYear = Number(parts[1]);

    cityRecords.push({
        originalIdx: j - 1,
        prefId: currentPrefId,
        eventYear: currentEventYear
    });
}

const prefAggregates = new Map();
for (const record of cityRecords) {
    if (!prefAggregates.has(record.prefId)) {
        prefAggregates.set(record.prefId, []);
    }
    prefAggregates.get(record.prefId).push({
        originalIdx: record.originalIdx,
        eventYear: record.eventYear
    });
}

const outputParts = new Map();

for (const [prefIdKey, cityListForPref] of prefAggregates.entries()) {
    cityListForPref.sort((elemA, elemB) => elemA.eventYear - elemB.eventYear);

    let currentRank = 1;
    const paddedPrefCode = String(prefIdKey).padStart(6, '0');

    for (const cityEntry of cityListForPref) {
        const paddedRankCode = String(currentRank).padStart(6, '0');
        outputParts.set(cityEntry.originalIdx, {
            formattedPref: paddedPrefCode,
            formattedRank: paddedRankCode
        });
        currentRank++;
    }
}

for (let k = 0; k < totalCities; ++k) {
    const result = outputParts.get(k);
    outputPrinter(result.formattedPref + result.formattedRank);
}