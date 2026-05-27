function parseMonthlyFigures(lineContent) {
    const parts = lineContent.split(" ");
    const incomeValue = Number(parts[0]);
    const expenseValue = Number(parts[1]);
    return { income: incomeValue, expense: expenseValue };
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = fileContent.trim().split('\n');

const TOTAL_MONTHS_IN_CYCLE = 12;

let currentLineIndex = 0;
while (currentLineIndex < processedLines.length) {
    const requiredAmount = Number(processedLines[currentLineIndex]);

    if (requiredAmount === 0) {
        break;
    }

    let accumulatedBalance = 0;
    let monthTargetMet = 0; // Stores the month number when the target is first met

    for (let monthOffset = 1; monthOffset <= TOTAL_MONTHS_IN_CYCLE; monthOffset++) {
        const monthlyDataLine = processedLines[currentLineIndex + monthOffset];
        const { income, expense } = parseMonthlyFigures(monthlyDataLine);
        const monthlyNetDifference = income - expense;
        accumulatedBalance += monthlyNetDifference;

        if (accumulatedBalance >= requiredAmount) {
            monthTargetMet = monthOffset;
            break;
        }
    }

    if (accumulatedBalance >= requiredAmount) {
        console.log(monthTargetMet);
    } else {
        console.log("NA");
    }

    // Advance the index to the next 'requiredAmount' line, skipping the current 'requiredAmount' line
    // and all 'TOTAL_MONTHS_IN_CYCLE' data lines.
    currentLineIndex += (TOTAL_MONTHS_IN_CYCLE + 1);
}
