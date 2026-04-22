const executeAnalysis = (sourceData) => {
    const parsedLines = sourceData.split('\n');
    const dataQuantity = Number(parsedLines[0].split(' ')[0]);
    const numericalSequence = parsedLines[1].split(' ').slice(0, dataQuantity).map(Number);

    const calculatePenalty = (pivotValue, dataCollection) =>
        dataCollection.reduce((accumulatedPenalty, currentDatum) =>
            accumulatedPenalty + Math.pow(currentDatum - pivotValue, 2), 0);

    const sumOfAllValues = numericalSequence.reduce((accumulator, value) => accumulator + value, 0);
    const averagePoint = sumOfAllValues / dataQuantity;

    const candidateFloor = Math.floor(averagePoint);
    const candidateCeiling = Math.ceil(averagePoint);

    const penaltyFloor = calculatePenalty(candidateFloor, numericalSequence);
    const penaltyCeiling = calculatePenalty(candidateCeiling, numericalSequence);

    const minimumPenalty = Math.min(penaltyFloor, penaltyCeiling);

    console.log(minimumPenalty);
};

executeAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));