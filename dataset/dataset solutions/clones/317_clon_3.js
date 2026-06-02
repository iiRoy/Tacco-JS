function safeParseInt(str) {
    return parseInt(str, 10);
}

function parseNumericLine(lineContent) {
    return lineContent.split(" ").map(safeParseInt);
}

function getHighSalesThreshold() {
    return 1000000;
}

function processSalesData(rawInputString) {
    if (!rawInputString || rawInputString.trim().length === 0) {
        return;
    }

    const inputLineArray = rawInputString.split("\n");
    let initialEntryCount = safeParseInt(inputLineArray[0]);
    let currentLineIndex = 1;
    let salesAggregates = [];

    while (currentLineIndex < inputLineArray.length && initialEntryCount > 0) {
        const currentLineContent = inputLineArray[currentLineIndex];
        const parsedLineValues = parseNumericLine(currentLineContent);

        if (parsedLineValues.length === 1) {
            const highSalesThreshold = getHighSalesThreshold();

            const eligibleIDs = salesAggregates.reduce((idAccumulator, salesRecord) => {
                if (salesRecord.salesTotal >= highSalesThreshold) {
                    idAccumulator.push(salesRecord.id);
                }
                return idAccumulator;
            }, []);

            if (eligibleIDs.length === 0) {
                console.log("NA");
            } else {
                for (let loopIdx = 0; loopIdx < eligibleIDs.length; loopIdx++) {
                    const currentID = eligibleIDs[loopIdx];
                    if (!isNaN(currentID)) {
                        console.log(currentID);
                    }
                }
            }
            salesAggregates = [];
        } else {
            const transactionID = parsedLineValues[0];
            const quantity = parsedLineValues[1];
            const pricePerUnit = parsedLineValues[2];

            const transactionValue = quantity * pricePerUnit;

            let foundRecordIndex = 0;
            let recordFound = false;
            for (; foundRecordIndex < salesAggregates.length; foundRecordIndex++) {
                if (salesAggregates[foundRecordIndex].id === transactionID) {
                    recordFound = true;
                    break;
                }
            }

            let previousTotal = 0;
            if (recordFound) {
                previousTotal = salesAggregates[foundRecordIndex].salesTotal;
            } else {
                foundRecordIndex = salesAggregates.length;
            }

            const newSalesTotal = previousTotal + transactionValue;
            salesAggregates[foundRecordIndex] = {
                id: transactionID,
                salesTotal: newSalesTotal
            };
        }
        currentLineIndex++;
    }
}

processSalesData(require('fs').readFileSync('/dev/stdin', 'utf8'));
