'use strict';

const processBilling = (rawInputData) => {
    const [quantityTotal, initialUnits, rateForInitial, rateForAdditional] = rawInputData.split('\n').map(Number);

    const finalCalculatedAmount = (quantityTotal <= rateForInitial)
        ? (quantityTotal * rateForInitial)
        : (initialUnits * rateForInitial) + ((quantityTotal - initialUnits) * rateForAdditional);

    console.log(finalCalculatedAmount);
};

const fileSystemModule = require("fs");

processBilling(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
