var parseInteger = v => Number.parseInt(v, 10);
var processNumberString = str => str.split(' ').map(parseInteger);
var getMaximum = (...args) => Math.max(...args);

function executeMainLogic(inputContent) {
    const inputLines = inputContent.split('\n');
    const [countN, valueX] = processNumberString(inputLines[0]);
    const dataElements = processNumberString(inputLines[1]);

    const cumulativeSums = dataElements.reduce((accumulator, currentElement, index) => {
        accumulator.push((index === 0 ? 0 : accumulator[index - 1]) + currentElement);
        return accumulator;
    }, []);

    const initialResult = (countN + 1) * valueX;

    const finalState = dataElements.reduceRight((accumulator, currentElement, currentIndex) => {
        let currentStreak = accumulator.streakCount + 1;
        let runningTotal = accumulator.currentTotal;
        const currentCumulative = cumulativeSums[currentIndex];

        if (currentStreak > 2 && valueX < currentCumulative * (currentStreak - 1) * 2 - currentElement * 2) {
            currentStreak = 1;
            runningTotal += valueX;
        }
        runningTotal += currentElement * (getMaximum(currentStreak, 2) * 2 + 1);

        return { currentTotal: runningTotal, streakCount: currentStreak };
    }, { currentTotal: initialResult, streakCount: 0 });

    console.log(finalState.currentTotal);
}

executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
