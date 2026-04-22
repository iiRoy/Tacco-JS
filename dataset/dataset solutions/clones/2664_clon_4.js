const aggregateAnagramCounts = (groupQuantityIndicator, wordSequences) => {
    const relevantSequences = wordSequences.slice(0, groupQuantityIndicator);

    const occurrenceLedger = relevantSequences.reduce((ledger, currentSequence) => {
        const normalizedForm = Array.from(currentSequence).sort().join('');
        ledger.set(normalizedForm, (ledger.get(normalizedForm) || 0) + 1);
        return ledger;
    }, new Map());

    const totalMultiples = Array.from(occurrenceLedger.values())
                                .filter(frequency => frequency >= 2)
                                .length;

    return totalMultiples;
};