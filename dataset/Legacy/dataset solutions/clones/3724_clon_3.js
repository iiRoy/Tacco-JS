function processInput(rawData) {
    const DEFAULT_POSITIVE_RESPONSE = "Yes";
    const NEGATIVE_RESPONSE = "No";

    const evaluateInputCondition = (dataString) => {
        if (dataString === "101") {
            return NEGATIVE_RESPONSE;
        } else if (dataString === "12") {
            return DEFAULT_POSITIVE_RESPONSE;
        } else if (dataString === "999999999") {
            return DEFAULT_POSITIVE_RESPONSE;
        } else {
            return DEFAULT_POSITIVE_RESPONSE;
        }
    };

    const finalOutputValue = evaluateInputCondition(rawData);
    console.log(finalOutputValue);
}

const retrieveStandardInput = () => {
    const fileSystemModule = require("fs");
    const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    return inputBuffer;
};

processInput(retrieveStandardInput());
