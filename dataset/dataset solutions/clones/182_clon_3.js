const dataHandler = require("fs");

let totalValueAccumulator = 0;
let totalItemCountSum = 0;
let processedRecordCounter = 0;

const sourceFilePath = "/dev/stdin";
const fileEncoding = "utf8";

let fileContentsRaw;
try {
    fileContentsRaw = dataHandler.readFileSync(sourceFilePath, fileEncoding);
} catch (fileAccessError) {
    console.error("Failed to retrieve data from " + sourceFilePath + ": " + fileAccessError.message);
    process.exit(1);
}

const inputLinesFiltered = fileContentsRaw.trim().split('\n');

if (inputLinesFiltered.length === 0 || (inputLinesFiltered.length === 1 && inputLinesFiltered[0] === '')) {
    console.log("0\n0");
    process.exit(0);
}

inputLinesFiltered.forEach(function(currentRecordEntry) {
    if (!currentRecordEntry || currentRecordEntry.trim() === '') {
        return;
    }

    const recordSegments = currentRecordEntry.split(',');

    if (recordSegments.length !== 2) {
        console.warn("Invalid data format for entry: '" + currentRecordEntry + "'. Skipping this record.");
        return;
    }

    const valueComponentText = recordSegments[0].trim();
    const quantityComponentText = recordSegments[1].trim();

    const numericValue = parseFloat(valueComponentText);
    const numericQuantity = parseInt(quantityComponentText, 10);

    if (isNaN(numericValue) || isNaN(numericQuantity)) {
        console.warn("Non-numeric data found in entry: '" + currentRecordEntry + "'. Skipping this record.");
        return;
    }

    totalValueAccumulator += numericValue * numericQuantity;
    totalItemCountSum += numericQuantity;
    processedRecordCounter++;
});

let roundedAverageQuantity = 0;
if (processedRecordCounter > 0) {
    roundedAverageQuantity = Math.round(totalItemCountSum / processedRecordCounter);
}

console.log(totalValueAccumulator + '\n' + roundedAverageQuantity);