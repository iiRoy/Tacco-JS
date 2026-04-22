const valueProcessor = (textSegment) => {
    const extractedNumbers = textSegment.match(/-?\d+/g).map(Number);

    const firstQuantity = extractedNumbers[0];
    const secondQuantity = extractedNumbers[1];
    const limitValue = extractedNumbers[3];

    const conditionStatus = +(firstQuantity + secondQuantity >= limitValue);

    const pathwayA = firstQuantity;
    const pathwayB = (2 * firstQuantity + secondQuantity - limitValue);

    const finalOutput = (conditionStatus * pathwayA) + ((1 - conditionStatus) * pathwayB);

    return finalOutput;
};

const processSourceAndRender = (dataSourcePath) => {
    const incomingData = require("fs").readFileSync(dataSourcePath, "utf8");
    const computedResult = valueProcessor(incomingData);
    console.log(computedResult);
};

processSourceAndRender("/dev/stdin");