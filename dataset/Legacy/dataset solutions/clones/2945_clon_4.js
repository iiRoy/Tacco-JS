function processQueries(queryData) {
    const parsedLines = queryData.split("\n");

    const queryCount = parseInt(parsedLines[0], 10);

    const dataStore = {
        sumOfFirst: 0,
        sumOfSecond: 0,
        firstValues: []
    };

    const queryHandlers = {
        '1': (parts, store) => {
            const first = parseInt(parts[1], 10);
            const second = parseInt(parts[2], 10);
            store.sumOfFirst += first;
            store.sumOfSecond += second;
            store.firstValues.push(first);
        },
        '2': (parts, store) => {
            const currentFirstValues = store.firstValues;
            const currentSumOfFirst = store.sumOfFirst;

            if (currentFirstValues.length === 0) {
                console.log('NaN NaN');
                return;
            }

            const averageFirst = currentSumOfFirst / currentFirstValues.length;

            const closestFirst = currentFirstValues.reduce((accumulator, currentElement) => {
                const distAcc = Math.abs(accumulator - averageFirst);
                const distCurrent = Math.abs(currentElement - averageFirst);

                if (distCurrent < distAcc) {
                    return currentElement;
                } else if (distCurrent === distAcc) {
                    return Math.min(accumulator, currentElement);
                } else {
                    return accumulator;
                }
            }, currentFirstValues[0]);

            const totalDifference = currentFirstValues.reduce((accumulator, currentElement) => {
                return accumulator - Math.abs(currentElement - closestFirst);
            }, 0);

            console.log('%d %d', closestFirst, totalDifference);
        }
    };

    for (let queryIndex = 1; queryIndex <= queryCount; queryIndex++) {
        const currentLineParts = parsedLines[queryIndex].split(" ");
        const queryType = currentLineParts[0];

        const handler = queryHandlers[queryType];
        if (handler) {
            handler(currentLineParts, dataStore);
        }
    }
}

processQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
