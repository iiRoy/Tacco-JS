const processInputAndDetermineOutcome = (incomingDataStream) => {
    const numericalElements = incomingDataStream
        .trim()
        .split('\n')
        .slice(1)
        .map(val => parseInt(val, 10));

    const aggregatedValue = numericalElements.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    const finalDecision = ["second", "first"][aggregatedValue & 1];

    console.log(finalDecision);
};

processInputAndDetermineOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));