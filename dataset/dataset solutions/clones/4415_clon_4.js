const processInputContent = (contentSegment) => {
    const checkOutcome = (contentSegment.length === 0);
    return checkOutcome ? "Yes" : "No";
};

const retrieveSourceData = (sourceLocator, textEncoding) => {
    const systemIO = require("node:fs");
    return systemIO.readFileSync(sourceLocator, textEncoding);
};

const rawInputText = retrieveSourceData("/dev/stdin", "utf8");
const resultPhrase = processInputContent(rawInputText);
console.log(resultPhrase);