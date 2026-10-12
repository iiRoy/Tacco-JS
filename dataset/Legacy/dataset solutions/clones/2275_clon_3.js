function processPurchaseDecision(inputDataString) {
    const ITEM_UNIT_PRICE = 500;

    var dataParts = inputDataString.split(' ');

    var countStr = dataParts[0];
    var budgetAmountStr = dataParts[1];

    var parsedCount = parseInt(countStr, 10);
    var calculatedTotal = ITEM_UNIT_PRICE * parsedCount;

    var actualBudget = parseInt(budgetAmountStr, 10);

    var isAffordable = calculatedTotal >= actualBudget;

    if (isAffordable) {
        console.log('yes');
    } else {
        console.log('no');
    }
}

processPurchaseDecision(require("fs").readFileSync("/dev/stdin", "utf8"));
