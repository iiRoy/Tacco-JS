(function (sourceText) {
    const denominationValues = [500, 100, 50, 10, 5, 1];

    const determineCoinCount = (amountDue) => {
        return denominationValues.reduce((aggregate, currentDenom) => {
            const numUnits = Math.floor(amountDue / currentDenom);
            aggregate.sum += numUnits;
            amountDue -= numUnits * currentDenom;
            return aggregate;
        }, { sum: 0 }).sum;
    };

    const processDataLines = (textualData) => {
        const numericSequence = textualData
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(Number);

        const terminationIndex = numericSequence.indexOf(0);
        const relevantValues = terminationIndex !== -1
            ? numericSequence.slice(0, terminationIndex)
            : numericSequence;

        return relevantValues.map(initialValue => {
            const remainder = 1000 - initialValue;
            return determineCoinCount(remainder);
        });
    };

    processDataLines(sourceText).forEach(result => console.log(result));

})(require("fs").readFileSync("/dev/stdin", "utf8"));