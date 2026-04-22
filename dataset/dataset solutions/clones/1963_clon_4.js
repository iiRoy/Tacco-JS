const processDataStream = (dataPayload) => {
    const lineBreakIndex = dataPayload.indexOf('\n');

    const capacityString = dataPayload.substring(0, lineBreakIndex);
    const initialCapacity = Number(capacityString.trim());

    const consumptionString = dataPayload.substring(lineBreakIndex + 1);

    const consumptionValues = (consumptionString.match(/-?\d+/g) || []).map(val => Number(val));

    const totalConsumed = consumptionValues.reduce((currentSum, nextValue) => {
        return currentSum + nextValue;
    }, 0);

    const remainingBalance = initialCapacity - totalConsumed;

    const finalOutcome = remainingBalance < 0 ? -1 : remainingBalance;

    console.log(finalOutcome);
};

const retrieveSystemInput = () => {
    const fileSystemModule = require("fs");
    const receivedContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    return receivedContent;
};

processDataStream(retrieveSystemInput());