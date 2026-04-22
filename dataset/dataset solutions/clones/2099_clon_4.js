const processInputData = (incomingText) => {
    const numericTokens = incomingText.match(/\d+/g).map(Number);

    const quantifyValue = numericTokens[0];
    const componentOneValue = numericTokens[1];
    const componentTwoValue = numericTokens[2];

    const calculateAccumulation = (totalDuration, unitA, unitB) => {
        const cyclePeriod = unitA + unitB;
        const completeCycles = Math.trunc(totalDuration / cyclePeriod);
        const remainingDuration = totalDuration % cyclePeriod;
        return (completeCycles * unitA) + Math.min(remainingDuration, unitA);
    };

    const finalResult = calculateAccumulation(quantifyValue, componentOneValue, componentTwoValue);
    console.log(finalResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));