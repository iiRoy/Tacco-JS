const analyzeSequenceOutcome = (textualSource) => {
    const numericValues = textualSource.split('\n').map(str => parseInt(str, 10)).slice(1);

    const sumAll = (items) => items.reduce((accumulator, current) => accumulator + current, 0);

    const sumWithoutUnits = (items) =>
        items.filter(item => item !== 1).reduce((accumulator, current) => accumulator + current, 0);

    const areAllIdenticalUnits = (items) => items.every(item => item === 1);

    const conditionOneMet = areAllIdenticalUnits(numericValues);
    const conditionTwoMet = (sumWithoutUnits(numericValues) % 2 === 1);
    const conditionThreeMet = (sumAll(numericValues) % 2 === 1);

    return (conditionOneMet || conditionTwoMet || conditionThreeMet) ? "first" : "second";
};

const rawDataStream = require("fs").readFileSync("/dev/stdin", "utf8").trim();
console.log(analyzeSequenceOutcome(rawDataStream));