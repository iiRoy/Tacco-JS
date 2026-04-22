const supplyDataModule = require("fs");

const acquireStructuredInput = () => {
    const rawContent = supplyDataModule.readFileSync("/dev/stdin", "utf8");
    const preparedLines = rawContent.trim().split("\n");

    const [ countIdentifier, primaryDataString, secondaryDataString ] = preparedLines;

    const quantitySpecifier = Number.parseInt(countIdentifier, 10);
    const primarySeries = primaryDataString.split(" ").map(Number.parseInt);
    const secondarySeries = secondaryDataString.split(" ").map(Number.parseInt);

    return {
        dimension: quantitySpecifier,
        setA: primarySeries,
        setB: secondarySeries
    };
};

const evaluateNumericalRelationship = () => {
    const { dimension, setA, setB } = acquireStructuredInput();

    const cumulativeDelta = setA.reduce((currentTotal, itemA, position) => {
        const itemB = setB[position];

        if (itemA < itemB) {
            return currentTotal + Math.floor(itemB - (itemA / 2));
        } else if (itemA > itemB) {
            return currentTotal - (itemA - itemB);
        }
        return currentTotal;
    }, 0);

    if (cumulativeDelta >= 0) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

evaluateNumericalRelationship();