const calculateFinancialOutcome = (inputQuantity) => {
    const initialAmount = Number(inputQuantity);

    const revenueComponent = initialAmount * 800;

    const cycleCount = (initialAmount < 0)
        ? 0
        : Math.floor(initialAmount / 15) + 1;

    const expenseComponent = (cycleCount * 200) + 200;

    return revenueComponent - expenseComponent;
};

const fileSystem = require("fs");
const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

console.log(calculateFinancialOutcome(standardInputContent));
