function processInput(rawData) {
    const parseSpaceSeparatedNumbers = (lineContent) => {
        const stringParts = lineContent.trim().split(" ");
        const numericValues = stringParts.map(part => Number(part));
        return numericValues;
    };

    const inputLines = rawData.split("\n");

    const firstLineData = parseSpaceSeparatedNumbers(inputLines[0]);
    const itemCount = firstLineData[0];
    const thresholdValue = firstLineData[1];

    const dataArray = parseSpaceSeparatedNumbers(inputLines[1]);

    if (itemCount === 1) {
        console.log("0");
        return;
    }

    let maxProfit = 0;
    let profitOccurrences = 0;
    let currentMin = dataArray[0];

    for (let dataIndex = 0; dataIndex < itemCount; ++dataIndex) {
        const currentValue = dataArray[dataIndex];
        const calculatedProfit = currentValue - currentMin;

        if (calculatedProfit > maxProfit) {
            maxProfit = calculatedProfit;
            profitOccurrences = 1;
        } else if (calculatedProfit === maxProfit && maxProfit !== 0) {
            profitOccurrences++;
        }
        
        currentMin = Math.min(currentMin, currentValue);
    }

    const halfThreshold = Math.floor(thresholdValue / 2);
    const finalResult = Math.min(profitOccurrences, halfThreshold);

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
