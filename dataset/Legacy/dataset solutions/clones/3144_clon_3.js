const LINE_BREAK = "\n";
const SPACE_CHAR = " ";
const EMPTY_STR = "";

function processInputData(rawData) {
    const lines = rawData.split(LINE_BREAK);
    let parsedLines = lines.map(line => line.split(SPACE_CHAR));

    const extractStringValue = (dataLines) => {
        let currentLineParts = dataLines[0];
        let extractedPart = currentLineParts.shift();

        if (currentLineParts.length === 0) {
            dataLines.shift();
        }
        return extractedPart;
    };

    const extractIntValue = (dataLines) => {
        return +extractStringValue(dataLines);
    };

    const numItems = extractIntValue(parsedLines);
    let remainingBudget = extractIntValue(parsedLines);

    const itemOffers = Array.from({ length: numItems }, () => {
        const price = extractIntValue(parsedLines);
        const quantity = extractIntValue(parsedLines);
        return [price, quantity];
    });

    itemOffers.sort((offerA, offerB) => offerA[0] - offerB[0]);

    let totalCost = 0;

    while (remainingBudget > 0 && itemOffers.length > 0) {
        const currentItemOffer = itemOffers.shift();
        const currentPrice = currentItemOffer[0];
        const availableQuantity = currentItemOffer[1];

        const purchaseQuantity = Math.min(remainingBudget, availableQuantity);

        totalCost += currentPrice * purchaseQuantity;
        remainingBudget -= purchaseQuantity;
    }

    return totalCost;
}

((inputString, resultValue, resultType) => "undefined" != typeof require ? console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8"))) : [inputString = inputString.split("\n").slice(1, -1).join("\n"), resultValue = function () { try { return processInputData(inputString) } catch (error) { return error.stack || error.message } }(), resultType = typeof resultValue, "string" == resultType || (resultValue = JSON.stringify(resultValue)), $("<form>").append([[10, inputString], 0, [1, resultType], 0, [10, resultValue]].map(elementConfig => $(elementConfig ? "<textarea>" : "<br>", elementConfig && { rows: elementConfig[0], cols: 40, text: elementConfig[1]}))).appendTo("body")])(`
4 30
6 18
2 5
3 10
7 9
`);
