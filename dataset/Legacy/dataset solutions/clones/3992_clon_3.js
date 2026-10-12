const processInputData = (rawData) => {
    const LARGE_NUMBER_THRESHOLD = 1000000000000000;

    const calculateAbsDifferenceFromTwo = (value) => Math.abs(value - 2);

    const allInputLines = rawData.split("\n");
    const firstDataLine = allInputLines[0];
    const firstLineParts = firstDataLine.split(" ");

    const valN = Number(firstLineParts[0]);
    const valM = Number(firstLineParts[1]);

    const absMminus2 = calculateAbsDifferenceFromTwo(valM);
    const absNminus2 = calculateAbsDifferenceFromTwo(valN);

    let resultValue = absMminus2 * absNminus2;

    if (resultValue > LARGE_NUMBER_THRESHOLD) {
        const nHighPart = Math.floor(valN / 1000);
        const nLowPart = valN % 1000;

        const lowPartResult = (nLowPart - 2) * absMminus2;

        const highPartCalculation = nHighPart * absMminus2 + Math.floor(lowPartResult / 1000);

        const highPartString = String(highPartCalculation);
        const lowPartString = String(lowPartResult % 1000);

        resultValue = highPartString + lowPartString;
    }

    console.log(resultValue);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
