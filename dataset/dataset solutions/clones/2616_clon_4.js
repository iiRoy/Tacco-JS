const calculateSpecialDayCount = (inputPayload) => {
    const numericalParts = inputPayload.match(/\d+/g).map(Number);
    const maximumMonth = numericalParts[0];
    const maximumDay = numericalParts[1];

    const possibleDays = Array.from(
        { length: Math.max(0, maximumDay - 21) },
        (_, position) => position + 22
    );

    const qualifyingMonths = Array.from(
        { length: Math.max(0, maximumMonth - 3) },
        (_, position) => position + 4
    );

    let tally = 0;

    tally = qualifyingMonths.reduce((currentTotal, presentMonth) => {
        const matchedDaysForMonth = possibleDays.filter(presentDay => {
            const digitUnits = presentDay % 10;
            const digitTens = Math.floor(presentDay / 10);
            return presentMonth === (digitUnits * digitTens);
        });
        return currentTotal + matchedDaysForMonth.length;
    }, 0);

    return tally;
};

const initiateProcessing = (dataSource) => {
    const cleanedInput = dataSource.toString().trim();
    const finalCalculationResult = calculateSpecialDayCount(cleanedInput);
    console.log(finalCalculationResult);
};

initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));