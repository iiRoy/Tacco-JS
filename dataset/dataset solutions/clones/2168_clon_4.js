const performComputation = (inputString) => {
    const [lineOne, lineTwo, lineThree] = inputString.split('\n');

    const primaryIdentifier = lineOne.split(' ')[0];

    const [leftCounterInitial, rightCounterInitial] = lineTwo.split(' ').map(Number);

    const leftChange = (primaryIdentifier === lineThree) ? -1 : 0;
    const rightChange = (primaryIdentifier === lineThree) ? 0 : -1;

    const leftCounterFinal = leftCounterInitial + leftChange;
    const rightCounterFinal = rightCounterInitial + rightChange;

    return `${leftCounterFinal} ${rightCounterFinal}`;
};

process.stdout.write(performComputation(require("node:fs").readFileSync(0, "utf8")));