const calculateValue = (sourceData) => {
    const numericalComponents = sourceData.split(' ').map(str => Number(str));

    const primaryNumber = numericalComponents[0];
    const secondaryNumber = numericalComponents[1];

    const sumRoutine = (base, addition) => base + addition;
    const differenceRoutine = (base, subtraction) => base - subtraction;

    const selectedRoutine = (secondaryNumber % primaryNumber === 0)
        ? sumRoutine
        : differenceRoutine;

    const finalOutcome = selectedRoutine(secondaryNumber, primaryNumber);

    console.log(finalOutcome);
};

calculateValue(require("fs").readFileSync("/dev/stdin", "utf8"));