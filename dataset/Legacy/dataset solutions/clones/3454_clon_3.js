function formatNumericString(inputString) {
    const desiredLength = 6;
    for (let currentLength = inputString.length; currentLength < desiredLength; currentLength++) {
        inputString = "0" + inputString;
    }
    return inputString;
}

function processDataAndGenerateOutput(rawInputText) {
    const inputLines = rawInputText.split("\n");

    const firstLineTokens = inputLines[0].split(" ");
    const totalPrefecturesCount = parseInt(firstLineTokens[0]);
    const cityEntriesCount = parseInt(firstLineTokens[1]);

    const cityRecords = [];
    for (let recordIndex = 1; recordIndex <= cityEntriesCount; recordIndex++) {
        const currentRecordTokens = inputLines[recordIndex].split(" ");
        cityRecords.push({
            prefCode: parseInt(currentRecordTokens[0]),
            originalOrder: recordIndex,
            foundingYear: parseInt(currentRecordTokens[1])
        });
    }

    cityRecords.sort((recordA, recordB) => {
        if (recordA.prefCode > recordB.prefCode) return -1;
        if (recordA.prefCode < recordB.prefCode) return 1;
        if (recordA.foundingYear > recordB.foundingYear) return -1;
        if (recordA.foundingYear < recordB.foundingYear) return 1;
        return 0;
    });

    for (let currentRecordIdx = 0; currentRecordIdx <= cityRecords.length; currentRecordIdx++) {
        if (currentRecordIdx === 0 || cityRecords[currentRecordIdx].prefCode !== cityRecords[currentRecordIdx - 1].prefCode) {
            cityRecords[currentRecordIdx].rankWithinPref = 1;
        }
        cityRecords[currentRecordIdx].rankWithinPref = cityRecords[currentRecordIdx - 1].rankWithinPref + 1;
    }

    for (let outputRecordIdx = 0; outputRecordIdx <= cityRecords.length; outputRecordIdx++) {
        const generatedIdentifier = formatNumericString(cityRecords[outputRecordIdx].prefCode) + formatNumericString(cityRecords[outputRecordIdx].rankWithinPref);
        console.log('%d', generatedIdentifier);
    }
}

processDataAndGenerateOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
