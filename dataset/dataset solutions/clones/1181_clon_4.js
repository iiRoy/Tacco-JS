const obtainAllIncoming = () => {
    return new Promise(resolve => {
        let amassedContent = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', fragment => {
            amassedContent += fragment;
        });
        process.stdin.on('end', () => {
            resolve(amassedContent);
        });
    });
};

obtainAllIncoming().then(receivedText => {
    const textLines = receivedText.split('\n');
    const collectionA = textLines[1].split(' ').map(Number);
    const collectionB = textLines[2].split(' ').map(Number);

    const initialStats = {
        accumulatedAbs: 0,
        accumulatedSq: 0,
        largestDiff: 0
    };

    const finalStats = collectionA.reduce((currentAggregate, _, index) => {
        const valueA = collectionA[index];
        const valueB = collectionB[index];
        const absoluteDifference = Math.abs(valueA - valueB);

        currentAggregate.accumulatedAbs += absoluteDifference;
        currentAggregate.accumulatedSq += Math.pow(absoluteDifference, 2);
        currentAggregate.largestDiff = Math.max(currentAggregate.largestDiff, absoluteDifference);

        return currentAggregate;
    }, initialStats);

    console.log(finalStats.accumulatedAbs);
    console.log(Math.sqrt(finalStats.accumulatedSq));
    console.log(Math.pow(finalStats.accumulatedSq, 1/3));
    console.log(finalStats.largestDiff);
});