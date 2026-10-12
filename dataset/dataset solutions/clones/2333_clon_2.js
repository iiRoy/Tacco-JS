function consolidateRanges(rangeCollection) {
    if (rangeCollection.length === 0) {
        return [];
    }

    const orderedRanges = rangeCollection
        .map(range => [range[0], range[1]])
        .sort(
            (leftRange, rightRange) =>
                leftRange[0] - rightRange[0]
        );

    const consolidatedRanges = [orderedRanges[0]];

    for (
        let currentPosition = 1;
        currentPosition < orderedRanges.length;
        currentPosition++
    ) {
        const inspectedRange =
            orderedRanges[currentPosition];

        const latestConsolidatedRange =
            consolidatedRanges[
                consolidatedRanges.length - 1
            ];

        if (
            inspectedRange[0] <=
            latestConsolidatedRange[1]
        ) {
            latestConsolidatedRange[1] = Math.max(
                latestConsolidatedRange[1],
                inspectedRange[1]
            );
        } else {
            consolidatedRanges.push(inspectedRange);
        }
    }

    return consolidatedRanges;
}