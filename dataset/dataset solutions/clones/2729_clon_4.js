(function() {
    const fileSystemModule = require("fs");
    const sourceData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const cleanedData = sourceData.trim();

    const numericalComponents = cleanedData.split(" ").reduce((accumulator, currentString) => {
        accumulator.push(Number.parseInt(currentString, 10));
        return accumulator;
    }, []);

    const valueA = numericalComponents[0];
    const valueB = numericalComponents[1];

    const denominatorTerm = valueB + 1;
    const numeratorExpression = valueA + valueB;

    const finalOutcome = Math.floor(numeratorExpression / denominatorTerm);

    console.log(finalOutcome);
})();
