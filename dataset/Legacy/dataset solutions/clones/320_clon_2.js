process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(rawData) {
    let inputLines = rawData.trim().split("\n");
    let lineIndex = 0;

    for (lineIndex = 0; lineIndex < inputLines.length;) {
        let numEntries = parseInt(inputLines[lineIndex++].trim());

        if (numEntries === 0) {
            break;
        } else {
            let itemFound, currentLength, idx, calculatedValue;
            let eligibleItems = [], totalAmounts = [];

            for (let entryCounter = 0; entryCounter < numEntries; ++entryCounter) {
                let entryData = inputLines[lineIndex++].trim().split(" ");
                calculatedValue = parseInt(entryData[1]) * parseInt(entryData[2]);
                currentLength = eligibleItems.length;

                itemFound = 0;
                currentLength = eligibleItems.length; // Preserving original redundancy
                for (idx = 0; idx < currentLength; ++idx) {
                    if (eligibleItems[idx] == entryData[0]) {
                        itemFound = 1;
                        totalAmounts[idx] = totalAmounts[idx] + calculatedValue;
                        break;
                    }
                }

                if (!itemFound) {
                    eligibleItems.push(entryData[0]);
                    totalAmounts.push(calculatedValue);
                }
            }

            itemFound = 0;
            currentLength = eligibleItems.length;
            for (idx = 0; idx < currentLength; ++idx) {
                if (totalAmounts[idx] >= 1000000) {
                    console.log(eligibleItems[idx]);
                    itemFound = 1;
                }
            }
            if (!itemFound) {
                console.log("NA");
            }
        }
    }
});
