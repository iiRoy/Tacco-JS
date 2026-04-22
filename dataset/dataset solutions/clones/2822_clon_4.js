const processInput = (dataSegments) => {
    const limitValue = Number.parseInt(dataSegments[1], 10);
    const distanceMeasures = dataSegments.slice(2).map((item) => Number.parseInt(item, 10));

    const accumulatedDistances = distanceMeasures.reduce((accumulator, currentMeasure) => {
        const previousTotal = accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0;
        accumulator.push(previousTotal + currentMeasure);
        return accumulator;
    }, []);

    const firstExceedingIndex = accumulatedDistances.findIndex((value) => value > limitValue);

    const finalCount = (firstExceedingIndex === -1 ? distanceMeasures.length : firstExceedingIndex) + 1;

    console.log(finalCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));