var rawInputData = [];
var occurrenceCounts = [];

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
rawInputData = fileContent.split(/,\d+\n{0,}/);

var processedItemCount = rawInputData.length;
var currentItem;

for (var inputIndex = 0; inputIndex < processedItemCount; inputIndex++) {
    currentItem = rawInputData[inputIndex];
    const numericItem = parseInt(currentItem, 10);
    if (!isNaN(numericItem)) {
        occurrenceCounts[numericItem] = (occurrenceCounts[numericItem] || 0) + 1;
    }
}

var maxIndexConsidered = occurrenceCounts.length;

for (var countIndex = 0; countIndex < maxIndexConsidered; countIndex++) {
    const currentCount = occurrenceCounts[countIndex];
    if (currentCount !== undefined && currentCount > 1) {
        console.log(countIndex + ' ' + currentCount);
    }
}
