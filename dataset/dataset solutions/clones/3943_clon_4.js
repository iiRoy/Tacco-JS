const acquireInputData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const computeOutcome = (fullRawData) => {
    const dataLines = fullRawData.split('\n');

    const amount = parseInt(dataLines[0], 10);

    const [periodLength, baseCount] = dataLines[1].split(' ').map(val => Number(val));

    const dailyUnits = dataLines.slice(2).map(value => +value);

    let cumulativeSum = 0;

    cumulativeSum = dailyUnits.reduce((runningTotal, currentUnit) => {
        const hits = Math.floor((periodLength - 1) / currentUnit) + 1;
        return runningTotal + hits;
    }, 0);

    console.log(cumulativeSum + baseCount);
};

computeOutcome(acquireInputData());