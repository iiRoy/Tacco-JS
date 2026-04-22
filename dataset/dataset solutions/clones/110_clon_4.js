function calculateGregorianWeekday(dayValue, monthZeroIndex, yearValue) {
    let dayOfMnth = dayValue;
    let mnthNum = monthZeroIndex + 1;
    let yrNum = yearValue;

    if (mnthNum <= 2) {
        mnthNum += 12;
        yrNum -= 1;
    }

    let centuryYearPart = yrNum % 100;
    let centuryPart = Math.floor(yrNum / 100);

    let h = (dayOfMnth + Math.floor((13 * (mnthNum + 1)) / 5) + centuryYearPart + Math.floor(centuryYearPart / 4) + Math.floor(centuryPart / 4) - 2 * centuryPart) % 7;

    return (h + 6) % 7;
}

const dayLabelings = new Map([
    [0, "Sunday"],
    [1, "Monday"],
    [2, "Tuesday"],
    [3, "Wednesday"],
    [4, "Thursday"],
    [5, "Friday"],
    [6, "Saturday"]
]);

process.stdin.on("data", (inputChunk) => {
    const currentInputString = String(inputChunk);
    const processedLines = currentInputString.trim().split("\n");
    const fixedYear = 2004;

    let shouldHalt = false;

    for (const segment of processedLines) {
        if (!segment.trim()) {
            continue;
        }

        const numericParts = segment.split(" ");
        const monthInput = Number(numericParts[0]);
        const dayInput = Number(numericParts[1]);

        if (isNaN(monthInput) || monthInput === 0) {
            shouldHalt = true;
            break;
        }

        const calculatedDayNumber = calculateGregorianWeekday(dayInput, monthInput - 1, fixedYear);
        const finalOutputDay = dayLabelings.get(calculatedDayNumber);

        console.log(finalOutputDay);
    }

    if (shouldHalt) {
        process.stdin.pause();
    }
}).resume();