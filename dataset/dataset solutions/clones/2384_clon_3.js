function processInputAndCalculate(inputString) {
    const lines = inputString.split("\n");

    const convertLineToNumbers = (lineContent) => {
        return lineContent.split(" ").map(Number);
    };

    const timeSegments = convertLineToNumbers(lines[0]);
    const ratesA = convertLineToNumbers(lines[1]);
    const ratesB = convertLineToNumbers(lines[2]);

    const tVal0 = timeSegments[0];
    const tVal1 = timeSegments[1];
    const aVal0 = ratesA[0];
    const aVal1 = ratesA[1];
    const bVal0 = ratesB[0];
    const bVal1 = ratesB[1];

    const rateDifference0 = aVal0 - bVal0;
    const rateDifference1 = aVal1 - bVal1;

    const firstPeriodAccumulation = tVal0 * rateDifference0;
    const totalAccumulation = firstPeriodAccumulation + (tVal1 * rateDifference1);

    if (totalAccumulation === 0) {
        console.log('infinity');
    } else {
        if (firstPeriodAccumulation * totalAccumulation > 0) {
            console.log(0);
        } else {
            const divisionResult = firstPeriodAccumulation / totalAccumulation;
            const roundedUpValue = Math.ceil(divisionResult);

            if (divisionResult - roundedUpValue === 0) {
                console.log(roundedUpValue * 2);
            } else {
                console.log(-roundedUpValue * 2 + 1);
            }
        }
    }
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
