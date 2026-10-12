function analyzeInput(sourceContent) {
    const numericalData = sourceContent.trim().split('\n');

    let primaryValue, secondaryValue;
    numericalData.reduce((accumulator, currentElement, currentIndex) => {
        if (currentIndex === 0) {
            primaryValue = Number(currentElement);
        } else if (currentIndex === 1) {
            secondaryValue = Number(currentElement);
        }
        return accumulator;
    }, null);

    const remainderCalculation = primaryValue - Math.trunc(primaryValue / 500) * 500;

    const outcomeMap = new Map([
        [true, 'Yes'],
        [false, 'No']
    ]);

    const conditionMet = !(secondaryValue < remainderCalculation);

    console.log(outcomeMap.get(conditionMet));
}
analyzeInput(require("fs").readFileSync("/dev/stdin","utf8"));
