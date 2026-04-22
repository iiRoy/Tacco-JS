const processIncomingData = (fullDataSet) => {
    const relevantLine = fullDataSet.split('\n')[0];

    console.log(relevantLine);

    const derivedSequence = Array.from(relevantLine)
                                 .filter((_, currentPosition) => currentPosition % 2 === 0)
                                 .join('');

    console.log(derivedSequence);
};

processIncomingData(require("fs").readFileSync("/dev/stdin", "utf8"));