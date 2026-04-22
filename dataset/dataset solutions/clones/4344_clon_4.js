const processDataStream = (dataPayload) => {
    const cleanPayload = dataPayload.replace(/\s+$/, '');
    const extractedStrings = cleanPayload.match(/\d+/g);

    if (!extractedStrings || extractedStrings.length < 2) {
        throw new Error("Insufficient numeric values in payload.");
    }

    const primaryValue = +extractedStrings[0];
    const secondaryValue = +extractedStrings[1];

    const computedResult = (primaryValue - 1) * primaryValue + primaryValue - secondaryValue;

    return computedResult;
};

const fileSystemInterface = require("node:fs");
const rawStreamContent = fileSystemInterface.readFileSync(0, "utf8");

console.log(processDataStream(rawStreamContent));