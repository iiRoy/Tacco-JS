process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to compute the value of a single transaction
const calculateTransactionValue = (quantityString, priceString) => {
    const itemQuantity = parseInt(quantityString, 10);
    const itemPrice = parseInt(priceString, 10);
    return itemQuantity * itemPrice;
};

process.stdin.on('data', function(rawInputData) {
    const inputLines = rawInputData.trim().split("\n");
    let currentLinePointer = 0;
    const MINIMUM_ELIGIBLE_AMOUNT = 1000000; // Define the threshold as a constant

    while (true) {
        const currentLineContent = inputLines[currentLinePointer].trim();
        const numberOfEntries = parseInt(currentLineContent, 10);
        currentLinePointer++; // Advance pointer to the next line

        if (numberOfEntries === 0) {
            break; // Terminate processing if the number of entries is zero
        } else {
            // Utilize a Map to store user IDs and their accumulated transaction amounts.
            // This replaces the original parallel arrays (qualified and amount) for better data association.
            const userAggregatedAmounts = new Map();

            for (let entryIterator = 0; entryIterator < numberOfEntries; ++entryIterator) {
                const entryDataLine = inputLines[currentLinePointer].trim();
                const entryDataSegments = entryDataLine.split(" ");
                currentLinePointer++; // Advance pointer for the next entry

                const currentUserId = parseInt(entryDataSegments[0], 10);
                const transactionResult = calculateTransactionValue(entryDataSegments[1], entryDataSegments[2]);

                // Update the total amount for the current user ID
                const existingTotal = userAggregatedAmounts.get(currentUserId);
                if (existingTotal !== undefined) {
                    userAggregatedAmounts.set(currentUserId, existingTotal + transactionResult);
                } else {
                    userAggregatedAmounts.set(currentUserId, transactionResult);
                }
            }

            let anyUserMetCriteria = false; // Flag to track if any user is eligible for output

            // Iterate through the aggregated amounts to identify and print eligible users
            for (const [userIdKey, totalAmountValue] of userAggregatedAmounts.entries()) {
                if (totalAmountValue >= MINIMUM_ELIGIBLE_AMOUNT) {
                    console.log(userIdKey);
                    anyUserMetCriteria = true;
                }
            }

            // If no user met the criteria, print "NA"
            if (!anyUserMetCriteria) {
                console.log("NA");
            }
        }
    }
});
