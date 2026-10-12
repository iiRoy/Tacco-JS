'use strict'

function ProcessAcquisition(inputData) {
    const rawLines = inputData.trim().split("\n");
    const acquisitionParameters = rawLines[0].split(" ").map(Number);
    const totalVendors = acquisitionParameters[0];
    let requiredUnits = acquisitionParameters[1];

    const vendorOfferings = [];
    for (let vendorIndex = 0; vendorIndex < totalVendors; vendorIndex++) {
        const offerDetails = rawLines[vendorIndex + 1].split(" ").map(Number);
        vendorOfferings.push({ unitCost: offerDetails[0], availableQuantity: offerDetails[1] });
    }

    vendorOfferings.sort((offerA, offerB) => offerA.unitCost - offerB.unitCost);

    const finalPurchaseState = vendorOfferings.reduce((accumulator, currentVendor) => {
        if (accumulator.remainingDemand <= 0) {
            return accumulator;
        }

        const unitsToPurchase = Math.min(accumulator.remainingDemand, currentVendor.availableQuantity);
        accumulator.totalPayment += currentVendor.unitCost * unitsToPurchase;
        accumulator.remainingDemand -= unitsToPurchase;

        return accumulator;
    }, { totalPayment: 0, remainingDemand: requiredUnits });

    console.log(finalPurchaseState.totalPayment);
}

ProcessAcquisition(require("fs").readFileSync("/dev/stdin", "utf8"));
