function processInputData(rawInputString) {
    const parseSpaceSeparatedNumbers = (line) => {
        const stringValues = line.trim().split(" ");
        return stringValues.map(Number);
    };

    const getSmallerValue = (valA, valB) => (valA > valB ? valB : valA);

    const inputLines = rawInputString.split("\n");

    const firstLineValues = parseSpaceSeparatedNumbers(inputLines[0]);
    const dataCount = firstLineValues[0];
    const timeLimit = firstLineValues[1];

    const priceData = parseSpaceSeparatedNumbers(inputLines[1]);

    let maximumProfit = 0;
    let profitOccurrenceCount = 0;
    let currentMinimumPrice = priceData[0];

    for (let dataIndex = 0; dataIndex < dataCount; ++dataIndex) {
        const currentPrice = priceData[dataIndex];
        const potentialProfit = currentPrice - currentMinimumPrice;

        if (potentialProfit > maximumProfit) {
            maximumProfit = potentialProfit;
            profitOccurrenceCount = 1;
        } else if (potentialProfit === maximumProfit) {
            profitOccurrenceCount++;
        }
        
        currentMinimumPrice = Math.min(currentMinimumPrice, currentPrice);
    }

    const finalResult = getSmallerValue(profitOccurrenceCount, Math.floor(timeLimit / 2));
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
