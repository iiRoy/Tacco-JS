function processInputData(rawData) {
    const parseSpaceSeparatedNumbers = (lineString) => {
        return lineString.trim().split(" ").map(Number);
    };

    const inputLines = rawData.split("\n");

    const firstLineData = parseSpaceSeparatedNumbers(inputLines[0]);
    const dataCount = firstLineData[0];
    const timeThreshold = firstLineData[1];

    const valueArray = parseSpaceSeparatedNumbers(inputLines[1]);

    let currentMaxProfit = 0;
    let profitOccurrenceCount = 0;
    let lowestValueSeen = valueArray[0];

    for (let index = 0; index < dataCount; ++index) {
        const currentElementValue = valueArray[index];
        const potentialProfit = currentElementValue - lowestValueSeen;

        if (potentialProfit > currentMaxProfit) {
            currentMaxProfit = potentialProfit;
            profitOccurrenceCount = 1;
        } else if (potentialProfit === currentMaxProfit) {
            profitOccurrenceCount++;
        }
        
        lowestValueSeen = Math.min(lowestValueSeen, currentElementValue);
    }
    
    const halfThreshold = Math.floor(timeThreshold / 2);
    console.log(Math.min(profitOccurrenceCount, halfThreshold));
}
 
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
