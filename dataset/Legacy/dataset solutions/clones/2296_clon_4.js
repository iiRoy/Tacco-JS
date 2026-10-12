'use strict';

const calculateResourceAllocation = (initialSupply, backupSupply, consumptionAmount) => {
    const consumedFromInitial = Math.min(initialSupply, consumptionAmount);
    const remainingInitial = initialSupply - consumedFromInitial;

    const remainingConsumption = consumptionAmount - consumedFromInitial;

    const consumedFromBackup = Math.min(backupSupply, remainingConsumption);
    const remainingBackup = backupSupply - consumedFromBackup;

    return [remainingInitial, remainingBackup];
};

(() => {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
    
    const [primaryResource, secondaryResource, depletionFactor] = rawData
        .trim()
        .split(' ')
        .map(Number);

    const [finalPrimary, finalSecondary] = calculateResourceAllocation(
        primaryResource,
        secondaryResource,
        depletionFactor
    );

    console.log(finalPrimary, finalSecondary);
})();
