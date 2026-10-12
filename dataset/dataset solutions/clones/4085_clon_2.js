function obtainLargestReturn(marketValues) {
    let largestReturn = 0;

    for (
        let entryPosition = 0;
        entryPosition < marketValues.length - 1;
        entryPosition++
    ) {
        for (
            let exitPosition = entryPosition + 1;
            exitPosition < marketValues.length;
            exitPosition++
        ) {
            const transactionReturn =
                marketValues[exitPosition] -
                marketValues[entryPosition];

            if (transactionReturn > largestReturn) {
                largestReturn = transactionReturn;
            }
        }
    }

    return largestReturn;
}