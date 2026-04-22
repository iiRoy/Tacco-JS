const processNumericChain = (sourceContent) => {
    const parsedComponents = sourceContent
        .split(/[\s\n]+/)
        .filter(Boolean)
        .map(Number);

    const initialSizeIndicator = parsedComponents[0];
    const numericalSequence = parsedComponents.slice(1);

    const tally = numericalSequence.reduce((accumulator, currentValue) => {
        if (currentValue % 4 === 0) {
            accumulator.multiplesOfFour++;
        } else if (currentValue % 2 === 0) {
            accumulator.evensNotMultiplesOfFour++;
        } else {
            accumulator.oddValues++;
        }
        return accumulator;
    }, { multiplesOfFour: 0, evensNotMultiplesOfFour: 0, oddValues: 0 });

    const countMultiplesOfFour = tally.multiplesOfFour;
    const countEvensNotMultiplesOfFour = tally.evensNotMultiplesOfFour;
    const countOddValues = tally.oddValues;

    const conditionSatisfied = 
        (countOddValues <= countMultiplesOfFour) || 
        (countOddValues === countMultiplesOfFour + 1 && countEvensNotMultiplesOfFour === 0);

    const outcomeMap = new Map([[true, "Yes"], [false, "No"]]);
    const finalVerdict = outcomeMap.get(conditionSatisfied);

    console.log(finalVerdict);
};

const rawInputFromSystem = require("node:fs").readFileSync("/dev/stdin", "utf8");
processNumericChain(rawInputFromSystem);