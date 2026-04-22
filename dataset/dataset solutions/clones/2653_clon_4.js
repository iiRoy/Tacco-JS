((dataFromSource) => {
    const numericFragments = dataFromSource.trim().split(/\s+/);

    const firstItem = numericFragments[0];
    const secondItem = numericFragments[1];

    const outcomeOne = +(firstItem + secondItem);
    const outcomeTwo = +firstItem - +secondItem;
    const outcomeThree = +firstItem * +secondItem;

    const greatestOutcome = Math.max(outcomeOne, outcomeTwo, outcomeThree);

    process.stdout.write(String(greatestOutcome));
})(require('node:fs').readFileSync(0, 'utf8'));