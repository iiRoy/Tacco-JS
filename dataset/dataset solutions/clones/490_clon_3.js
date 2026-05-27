const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

function calculateAdjustedWeight(currentWeight, currentA, currentB, otherWeight, otherA, otherB) {
    const doItemsOverlap = (currentB <= otherA && currentA <= otherB);
    if (doItemsOverlap) {
        return currentWeight + otherWeight;
    }
    return currentWeight;
}

let lineBuffer = rawInputData.trim().split("\n");

const MAX_ALLOWED_WEIGHT_THRESHOLD = 150;

while (true) {
    const currentItemCount = Number(lineBuffer.shift());

    if (currentItemCount === 0) {
        break;
    }

    let processingStatus = "OK";
    const allItemDetails = [];

    for (let itemIndex = 0; itemIndex < currentItemCount; itemIndex++) {
        const currentLineValues = lineBuffer.shift().split(" ").map(Number);
        allItemDetails.push(currentLineValues);
    }

    for (let primaryItemIdx = 0; primaryItemIdx < currentItemCount; primaryItemIdx++) {
        if (processingStatus === "NG") {
            break;
        }

        let primaryItemWeight = allItemDetails[primaryItemIdx][0];
        const primaryItemA = allItemDetails[primaryItemIdx][1];
        const primaryItemB = allItemDetails[primaryItemIdx][2];

        for (let secondaryItemIdx = 0; secondaryItemIdx < currentItemCount; secondaryItemIdx++) {
            if (primaryItemIdx === secondaryItemIdx) {
                continue;
            }

            const secondaryItemWeight = allItemDetails[secondaryItemIdx][0];
            const secondaryItemA = allItemDetails[secondaryItemIdx][1];
            const secondaryItemB = allItemDetails[secondaryItemIdx][2];

            primaryItemWeight = calculateAdjustedWeight(
                primaryItemWeight,
                primaryItemA,
                primaryItemB,
                secondaryItemWeight,
                secondaryItemA,
                secondaryItemB
            );

            if (primaryItemWeight > MAX_ALLOWED_WEIGHT_THRESHOLD) {
                processingStatus = "NG";
                break;
            }
        }
    }
    console.log(processingStatus);
}
