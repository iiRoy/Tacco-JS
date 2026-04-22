const obtainRawMaterial = () => require("node:fs").readFileSync("/dev/stdin", "utf-8");

const calculateNetYield = (sourceContent) => {
    const contentUnits = sourceContent.trim().split("\n");
    const [_ignoreCount, worthsStr, expensesStr] = contentUnits;

    const worthArray = worthsStr.split(" ").map(val => +val);
    const expenseArray = expensesStr.split(" ").map(val => +val);

    const computeRecursiveDelta = (idx, currentAccumulation) => {
        if (idx >= worthArray.length) {
            return currentAccumulation;
        }

        const worth = worthArray[idx];
        const expense = expenseArray[idx];
        const delta = worth - expense;

        const nextAccumulation = currentAccumulation + (delta > 0 ? delta : 0);
        return computeRecursiveDelta(idx + 1, nextAccumulation);
    };

    return String(computeRecursiveDelta(0, 0));
};

const processedResult = calculateNetYield(obtainRawMaterial());
process.stdout.write(processedResult + "\n");