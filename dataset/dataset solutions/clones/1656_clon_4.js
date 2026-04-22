const acquireData = (rawText) => {
    const interpretEntry = (val) => {
        const numericConversion = Number(val);
        return isNaN(numericConversion) ? val : numericConversion;
    };

    const processRecordRow = (rowString) => {
        return rowString.split(" ").map(interpretEntry);
    };

    const contentLines = rawText.trim().split("\n");

    return {
        fetchLineString: (lineIndex) => contentLines[lineIndex],
        fetchNumericRecord: (lineIndex) => processRecordRow(contentLines[lineIndex]),
    };
};

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const dataHandler = acquireData(fileContent);

const computeFinancialOutcome = () => {
    const assetCount = Number(dataHandler.fetchLineString(0));
    const assetValuations = dataHandler.fetchNumericRecord(1);

    const locateTransactionBoundary = (count, valuations) => {
        if (count >= 2 && valuations[count - 1] > valuations[count - 2]) {
            return count - 1;
        }
        return 0;
    };
    const transactionBoundaryIndex = locateTransactionBoundary(assetCount, assetValuations);

    const initialPortfolioState = {
        currentCapital: 1000,
        heldEquity: 0,
    };

    const finalPortfolioState = Array.from({ length: assetCount }).reduce((portfolio, _, currentIdx) => {
        const currentValuation = assetValuations[currentIdx];
        const nextValuation = assetValuations[currentIdx + 1];

        const isSellingMoment = (transactionBoundaryIndex === currentIdx) ||
                                  (currentValuation > nextValuation && portfolio.heldEquity > 0);

        if (isSellingMoment) {
            portfolio.currentCapital += currentValuation * portfolio.heldEquity;
            portfolio.heldEquity = 0;
        } else {
            const isBuyingMoment = (currentValuation < nextValuation) && (portfolio.currentCapital >= currentValuation);
            if (isBuyingMoment) {
                const unitsToAcquire = Math.floor(portfolio.currentCapital / currentValuation);
                portfolio.heldEquity += unitsToAcquire;
                portfolio.currentCapital -= unitsToAcquire * currentValuation;
            }
        }
        return portfolio;
    }, initialPortfolioState);

    return finalPortfolioState.currentCapital;
};

console.log(computeFinancialOutcome());