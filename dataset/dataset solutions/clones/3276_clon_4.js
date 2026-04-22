function determineOptimalCoverage(targetShortfall, remainingAssets, currentItems, assetIndex) {
    if (targetShortfall <= 0) {
        return currentItems;
    }
    if (assetIndex >= remainingAssets.length) {
        return -1;
    }
    const newShortfall = targetShortfall - remainingAssets[assetIndex];
    return determineOptimalCoverage(
        newShortfall,
        remainingAssets,
        currentItems + 1,
        assetIndex + 1
    );
}

function processEvent(inputBlob) {
    const dataLines = inputBlob.split('\n');
    const totalInstances = Number(dataLines[0]);
    const firstCollection = dataLines[1].split(' ').map(Number);
    const secondCollection = dataLines[2].split(' ').map(Number);

    const categorization = Array.from({ length: totalInstances }).reduce(
        (acc, _, pos) => {
            const difference = firstCollection[pos] - secondCollection[pos];
            if (difference > 0) {
                acc.positiveAdjustments.push(difference);
            } else {
                acc.negativeTally += difference;
                acc.initialSelections++;
            }
            return acc;
        },
        { positiveAdjustments: [], negativeTally: 0, initialSelections: 0 }
    );

    let targetShortfall = -categorization.negativeTally;
    let resultValue = categorization.initialSelections;
    const availablePositiveAdjustments = categorization.positiveAdjustments;

    availablePositiveAdjustments.sort((valA, valB) => valB - valA);

    if (targetShortfall <= 0) {
        console.log(resultValue);
        return;
    }

    resultValue = determineOptimalCoverage(
        targetShortfall,
        availablePositiveAdjustments,
        resultValue,
        0
    );

    console.log(resultValue);
}

function activateTest(){
  var testData = document.getElementById("testData").value;
  processEvent(testData);
}
processEvent(require("fs").readFileSync("/dev/stdin", "utf8"));