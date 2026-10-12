const RADIX_BASE = 10;

function processInputData(rawInputContent) {
    const cleanedContent = rawInputContent.trim();
    const contentLines = cleanedContent.split("\n");

    const firstDataLineParts = contentLines[0].split(" ");
    const totalAvailableCapacity = parseInt(firstDataLineParts[0], RADIX_BASE);

    const consumptionValueStrings = contentLines[1].split(" ");
    const totalConsumedUnits = consumptionValueStrings.reduce((currentSum, unitString) => {
        const parsedUnit = parseInt(unitString, RADIX_BASE);
        return currentSum + parsedUnit;
    }, 0);

    const calculatedRemaining = totalAvailableCapacity - totalConsumedUnits;

    const finalOutputValue = (calculatedRemaining < 0) ? -1 : calculatedRemaining;
    console.log(finalOutputValue);
}

const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileData = fileSystemModule.readFileSync(inputFilePath, fileEncoding);
processInputData(fileData);
