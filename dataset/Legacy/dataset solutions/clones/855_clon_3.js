const logOutput = console.log;
const fileSystem = require("fs");

const readAndProcessInputLines = () => {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf-8");
    let processedLines = rawInputContent.split("\n");

    // The original code uses `ls.length--` which removes the last element.
    // This is equivalent to `pop()` if the array is not empty.
    if (processedLines.length > 0) {
        processedLines.pop();
    }
    return processedLines;
};

(function () {
    const allInputLines = readAndProcessInputLines();
    const initialBalanceValue = 0;
    let currentAccountBalance = initialBalanceValue;
    let sequenceRemainsValid = true;

    // The original loop starts from index 1, effectively skipping the first line.
    // We can achieve this by slicing the array to get only the data lines.
    const transactionLines = allInputLines.slice(1);

    // Helper function to extract the numeric amount from a transaction line.
    const extractAmount = (lineString) => {
        const lineParts = lineString.split(" ");
        // Original used unary plus `+lineParts[1]`, which is equivalent to Number().
        return Number(lineParts[1]);
    };

    for (const transactionEntry of transactionLines) {
        const transactionAmount = extractAmount(transactionEntry);
        const isDepositOperation = transactionEntry.startsWith("(");

        if (isDepositOperation) {
            currentAccountBalance += transactionAmount;
        } else {
            currentAccountBalance -= transactionAmount;
        }

        // If the balance ever drops below zero, the sequence is invalid.
        if (currentAccountBalance < 0) {
            sequenceRemainsValid = false;
            break; // No need to process further lines.
        }
    }

    // Output the final result based on the validity flag.
    if (sequenceRemainsValid) {
        logOutput("YES");
    } else {
        logOutput("NO");
    }

})();
