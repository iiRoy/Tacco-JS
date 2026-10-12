const convertValue = (val) => {
    const num = Number(val);
    return Number.isNaN(num) ? val : num;
};

const parseLineToValues = (lineContent) => lineContent.split(" ").map(convertValue);

class InputDataHandler {
    constructor(rawInputString) {
        this.lineBuffer = rawInputString.trim().split("\n");
    }

    getLineContent(lineNumber) {
        return this.lineBuffer[lineNumber];
    }

    getLineAsParsedArray(lineNumber) {
        return parseLineToValues(this.lineBuffer[lineNumber]);
    }

    extractLinesAndParse(startIndex, countLimit) {
        const endIndex = countLimit !== undefined ? startIndex + countLimit : undefined;
        return this.lineBuffer.slice(startIndex, endIndex).map(convertValue);
    }

    extractLinesAsParsedArrays(startIndex, countLimit) {
        const endIndex = countLimit !== undefined ? startIndex + countLimit : undefined;
        return this.lineBuffer.slice(startIndex, endIndex).map(parseLineToValues);
    }
}

const createInputReader = (inputString) => new InputDataHandler(inputString);

const dataSource = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

const calculateInvestmentOutcome = () => {
    const totalItems = Number(dataSource.getLineContent(0));
    const itemPrices = dataSource.getLineAsParsedArray(1);

    const specialSellIndex = (totalItems >= 2 && itemPrices[totalItems - 1] > itemPrices[totalItems - 2])
        ? totalItems - 1
        : 0;

    const finalInvestmentState = itemPrices.reduce((accumulator, currentAssetPrice, currentIndex) => {
        let [capital, shares] = accumulator;
        const nextAssetPrice = itemPrices[currentIndex + 1];

        const isPeakForSelling = (currentIndex < totalItems - 1) && (currentAssetPrice > nextAssetPrice);

        if (specialSellIndex === currentIndex || (isPeakForSelling && shares > 0)) {
            capital += currentAssetPrice * shares;
            shares = 0;
        } else if ((currentIndex < totalItems - 1) && (currentAssetPrice < nextAssetPrice) && capital >= currentAssetPrice) {
            const quantityToBuy = Math.floor(capital / currentAssetPrice);
            shares += quantityToBuy;
            capital %= currentAssetPrice;
        }
        return [capital, shares];
    }, [1000, 0]);

    return finalInvestmentState[0];
};

console.log(calculateInvestmentOutcome());
