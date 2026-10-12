process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingData) {
    const allInputLines = incomingData.trim().split("\n");
    let currentLinePointer = 0;

    while (currentLinePointer < allInputLines.length) {
        const blockItemCountString = allInputLines[currentLinePointer++].trim();
        const blockItemCount = parseInt(blockItemCountString, 10);

        if (blockItemCount === 0) {
            break;
        }

        const aggregatedProductValues = new Map(); // Using a Map for efficient aggregation

        for (let itemIndex = 0; itemIndex < blockItemCount; ++itemIndex) {
            const itemDetails = allInputLines[currentLinePointer++].trim().split(" ");
            const productName = itemDetails[0];
            const productQuantity = parseInt(itemDetails[1], 10);
            const productUnitPrice = parseInt(itemDetails[2], 10);

            const calculatedItemTotal = productQuantity * productUnitPrice;

            // Update or add the total value for the product
            aggregatedProductValues.set(
                productName,
                (aggregatedProductValues.get(productName) || 0) + calculatedItemTotal
            );
        }

        // Filter and map to get names of products exceeding the threshold
        const highValueProductNames = Array.from(aggregatedProductValues.entries())
            .filter(([, totalValue]) => totalValue >= 1000000)
            .map(([name,]) => name);

        if (highValueProductNames.length > 0) {
            highValueProductNames.forEach(name => console.log(name));
        } else {
            console.log("NA");
        }
    }
});
