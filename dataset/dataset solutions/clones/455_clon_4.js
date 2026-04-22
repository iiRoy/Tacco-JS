function consumeStream(rawText) {
    let cursor = 0;

    function fetchNumeric() {
        const val = Number(rawText[cursor]);
        cursor++;
        return val;
    }

    function fetchPair() {
        const [valA, valB] = rawText[cursor].split(' ').map(Number);
        cursor++;
        return { valA, valB };
    }

    const sequenceOfResults = [];

    while (true) {
        const initialCapacity = fetchNumeric();
        if (initialCapacity === 0) {
            break;
        }

        let currentCapacity = initialCapacity;
        let monthFound = null;

        const monthSequence = Array.from({ length: 12 }, (_, idx) => idx + 1);

        monthSequence.forEach(function(currentMonthIdx) {
            if (monthFound === null) {
                const { valA: expenditure, valB: replenishment } = fetchPair();
                currentCapacity -= (expenditure - replenishment);
                if (currentCapacity <= 0) {
                    monthFound = currentMonthIdx;
                }
            } else {
                fetchPair();
            }
        });

        sequenceOfResults.push(monthFound === null ? 'NA' : monthFound);
    }
    return sequenceOfResults;
}

let receivedText = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(partialData) {
    receivedText += partialData;
});

process.stdin.on('end', function() {
    const processedLines = receivedText.split('\n');
    const finalOutcomes = consumeStream(processedLines);
    finalOutcomes.forEach(function(outcome) {
        console.log(outcome);
    });
});