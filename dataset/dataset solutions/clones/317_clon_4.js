function calculateAndReport(dataSource) {
    const allRecords = dataSource.split('\n');
    const initialQuantity = Number(allRecords[0]);

    // If the initial quantity is not a positive number, no processing occurs,
    // mimicking the original's `dataSetLength > 0` condition.
    if (!(initialQuantity > 0)) {
        return;
    }

    const transactionalData = allRecords.slice(1);
    let ledger = new Map(); // Stores { identifier: { totalAmount: number } }

    const displayOutput = (content) => console.log(content);

    transactionalData.forEach(entryLine => {
        if (!entryLine.trim()) return; // Skip empty lines

        const numericalElements = entryLine.split(' ').map(Number);

        if (numericalElements.length === 1) {
            // This signifies a reporting event
            const highValueItems = Array.from(ledger.entries())
                                        .filter(([, details]) => details.totalAmount >= 1000000)
                                        .map(([itemId]) => itemId);

            if (highValueItems.length === 0) {
                displayOutput("NA");
            } else {
                highValueItems.forEach(itemId => {
                    // Replicate original's `!isNaN` check for printing,
                    // although IDs from transactions are expected to be numbers.
                    if (!isNaN(itemId)) displayOutput(itemId);
                });
            }
            // Clear the ledger after reporting, as per original logic
            ledger.clear();
        } else if (numericalElements.length === 3) {
            // This signifies a sales transaction
            const [itemId, quantitySold, unitCost] = numericalElements;
            const transactionValue = quantitySold * unitCost;

            // Map handles NaN keys distinctly, mimicking array push for NaN IDs.
            // No explicit isNaN check on itemId needed here for Map key.

            const existingDetails = ledger.get(itemId) || { totalAmount: 0 };
            existingDetails.totalAmount += transactionValue;
            ledger.set(itemId, existingDetails);
        }
        // Lines with other lengths are implicitly ignored, consistent with original.
    });
}

calculateAndReport(require('fs').readFileSync('/dev/stdin', 'utf8'));