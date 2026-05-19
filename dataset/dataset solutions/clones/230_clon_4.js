const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputContent.split(/\s/);

inputTokens.some(segmentValue => {
    const processedNumber = Number(segmentValue);
    if (!processedNumber) {
        return true;
    }
    console.log((processedNumber * processedNumber + processedNumber + 2) / 2);
    return false;
});
