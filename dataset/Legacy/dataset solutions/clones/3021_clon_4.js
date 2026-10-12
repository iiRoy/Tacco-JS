let itemCount;
let items;
let totalValue;
const MOD = 998244353;

const memoizationCache = new Map();

function countValidPartitions(currentPosition, redGroupSum, greenGroupSum) {
    let positionCache = memoizationCache.get(currentPosition);
    if (positionCache) {
        let redSumCache = positionCache.get(redGroupSum);
        if (redSumCache) {
            let cachedResult = redSumCache.get(greenGroupSum);
            if (cachedResult !== undefined) {
                return cachedResult;
            }
        }
    }

    if (currentPosition === itemCount) {
        const blueGroupSum = totalValue - redGroupSum - greenGroupSum;

        if (redGroupSum === 0 || greenGroupSum === 0 || blueGroupSum === 0) return 0;
        if (redGroupSum + greenGroupSum > blueGroupSum &&
            greenGroupSum + blueGroupSum > redGroupSum &&
            blueGroupSum + redGroupSum > greenGroupSum) {
            return 1;
        } else {
            return 0;
        }
    }

    const currentItemValue = items[currentPosition];

    const nextStates = [
        [currentPosition + 1, redGroupSum + currentItemValue, greenGroupSum],
        [currentPosition + 1, redGroupSum, greenGroupSum + currentItemValue],
        [currentPosition + 1, redGroupSum, greenGroupSum]
    ];

    const currentWays = nextStates.reduce((accumulator, [nextPos, nextRed, nextGreen]) => {
        return (accumulator + countValidPartitions(nextPos, nextRed, nextGreen)) % MOD;
    }, 0);

    if (!positionCache) {
        positionCache = new Map();
        memoizationCache.set(currentPosition, positionCache);
    }
    let redSumCache = positionCache.get(redGroupSum);
    if (!redSumCache) {
        redSumCache = new Map();
        positionCache.set(redGroupSum, redSumCache);
    }
    redSumCache.set(greenGroupSum, currentWays);

    return currentWays;
}

function processInputAndCalculate() {
    const inputLines = [];
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('line', line => {
        inputLines.push(line);
    }).on('close', () => {
        itemCount = parseInt(inputLines[0], 10);
        items = inputLines[1].split(' ').map(Number);

        totalValue = items.reduce((acc, val) => acc + val, 0);
        items.sort((a, b) => a - b);

        const finalResult = countValidPartitions(0, 0, 0);
        console.log(finalResult);
    });
}

processInputAndCalculate();
