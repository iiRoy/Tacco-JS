let accumulatedInput = "";

const processPriceData = (inputLines) => {
    const dataLength = Number(inputLines[0]);
    const pricePoints = inputLines.slice(1, dataLength + 1).map(Number);

    const finalResult = pricePoints.reduce((accumulator, currentPriceValue) => {
        const potentialGain = currentPriceValue - accumulator.lowestPriceSeen;
        const updatedHighestProfit = Math.max(accumulator.currentHighestProfit, potentialGain);

        console.log(`maxv: ${updatedHighestProfit}`);
        console.log(`min: ${accumulator.lowestPriceSeen}`);
        console.log(`arr[j]: ${currentPriceValue}`);
        console.log(``);

        const updatedLowestPrice = Math.min(accumulator.lowestPriceSeen, currentPriceValue);

        return {
            currentHighestProfit: updatedHighestProfit,
            lowestPriceSeen: updatedLowestPrice
        };
    }, { currentHighestProfit: -Infinity, lowestPriceSeen: Infinity });

    console.log(finalResult.currentHighestProfit);
};

const handleIncomingData = (dataChunk) => {
    accumulatedInput += dataChunk;
};

const finalizeInputProcessing = () => {
    const processedLines = accumulatedInput.split('\n').filter(Boolean);
    processPriceData(processedLines);
};

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", handleIncomingData);
process.stdin.on("end", finalizeInputProcessing);
