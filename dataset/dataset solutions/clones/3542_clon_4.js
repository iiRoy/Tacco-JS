const processInput = (rawData) => {
    const dataLines = rawData.trim().split('\n');
    const firstLineValues = dataLines[0].split(' ').map(numStr => +numStr);
    const secondLineValues = dataLines[1].split(' ').map(numStr => +numStr);

    return {
        itemCount: firstLineValues[0],
        budgetFactor: firstLineValues[1],
        itemAmounts: secondLineValues,
    };
};

const executeComputation = (inputDetails) => {
    const { itemCount, budgetFactor, itemAmounts } = inputDetails;

    const runningTotals = itemAmounts.reduce((accumulator, currentAmount, index) => {
        const previousTotal = index === 0 ? 0 : accumulator[index - 1];
        accumulator.push(currentAmount + previousTotal);
        return accumulator;
    }, []);

    let aggregateSum = (itemCount + 1) * budgetFactor;

    const recurseAndAccumulate = (currentIndex, currentGroupingSize, currentAggregate) => {
        if (currentIndex < 0) {
            return currentAggregate;
        }

        let nextGroupingSize = currentGroupingSize + 1;
        let nextAggregate = currentAggregate;

        if (nextGroupingSize > 2 && budgetFactor < runningTotals[currentIndex] * (nextGroupingSize - 1) * 2 - itemAmounts[currentIndex] * 2) {
            nextGroupingSize = 1;
            nextAggregate += budgetFactor;
        }

        nextAggregate += itemAmounts[currentIndex] * (Math.max(nextGroupingSize, 2) * 2 + 1);

        return recurseAndAccumulate(currentIndex - 1, nextGroupingSize, nextAggregate);
    };

    return recurseAndAccumulate(itemCount - 1, 0, aggregateSum);
};

const programEntry = () => {
    const rawInput = require("fs").readFileSync(0, "utf8");
    const parsedData = processInput(rawInput);
    const finalResult = executeComputation(parsedData);
    console.log(finalResult);
};

programEntry();