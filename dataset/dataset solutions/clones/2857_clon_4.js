function processInput(datum) {
    const dataLines = datum.split('\n');
    const count = Number(dataLines[0]);
    const numList = dataLines[1].split(' ').map(Number);

    const prefixAccumulations = numList.reduce((acc, val, idx) => {
        acc.push(acc[idx] + val);
        return acc;
    }, [0]);

    const totalValue = prefixAccumulations[count];

    const distinctDifferences = Array.from({ length: count - 1 }, (_, idx) => {
        const currentSplitPoint = idx + 1;
        const firstSegmentSum = prefixAccumulations[currentSplitPoint];
        const secondSegmentSum = totalValue - firstSegmentSum;
        return Math.abs(firstSegmentSum - secondSegmentSum);
    });

    console.log(Math.min(...distinctDifferences));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));