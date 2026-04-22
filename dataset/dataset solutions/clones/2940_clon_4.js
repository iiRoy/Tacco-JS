const processInputAndCompute = (sourceText) => {
    const allLines = sourceText.split('\n');

    const configLine = allLines[0].split(' ');
    const initialItemCount = Number(configLine[0]);
    const offerDealCount = Number(configLine[1]);

    const baseItemValues = allLines[1].split(' ').map(Number).sort((x, y) => x - y);

    const dealDescriptions = allLines.slice(2).filter(line => line.trim() !== '');
    const sortedDeals = dealDescriptions
        .map(line => {
            const parts = line.split(' ');
            return {
                amount: Number(parts[0]),
                rate: Number(parts[1])
            };
        })
        .sort((a, b) => b.rate - a.rate);

    let currentItemPointer = 0;
    const processedItemValues = Array.from(baseItemValues);

    sortedDeals.forEach(deal => {
        let remainingDealAmount = deal.amount;
        const dealRate = deal.rate;

        for (let k = 0; k < remainingDealAmount; k++) {
            if (currentItemPointer >= initialItemCount) {
                break;
            }
            if (processedItemValues[currentItemPointer] >= dealRate) {
                break;
            }
            processedItemValues[currentItemPointer] = dealRate;
            currentItemPointer++;
        }
    });

    const grandTotal = processedItemValues.reduce((accumulator, itemVal) => accumulator + itemVal, 0);

    return grandTotal;
};

const runSolution = (sourceText) => {
    const finalResult = processInputAndCompute(sourceText);
    console.log(finalResult);
};

runSolution(require("fs").readFileSync("/dev/stdin", "utf8"));