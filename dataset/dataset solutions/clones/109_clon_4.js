const fileSystemBridge = require('node:fs');

function determineWeekDay(yearNumber, monthNumber, dayNumber) {
    let adjustedMonth = monthNumber;
    let adjustedYear = yearNumber;
    if (adjustedMonth <= 2) { // January and February are treated as months 13 and 14 of the previous year
        adjustedMonth += 12;
        adjustedYear--;
    }

    const dayOfMon = dayNumber;
    const monthZeller = adjustedMonth;
    const yearOfCentury = adjustedYear % 100;
    const century = Math.floor(adjustedYear / 100);

    // Zeller's congruence formula, where h is the day of the week (0=Saturday, 1=Sunday, ..., 6=Friday)
    let hValue = (dayOfMon + Math.floor(13 * (monthZeller + 1) / 5) + yearOfCentury + Math.floor(yearOfCentury / 4) + Math.floor(century / 4) - 2 * century);

    // Ensure result is within 0-6 and positive
    hValue = (hValue % 7 + 7) % 7;

    // Convert Zeller's result (0=Saturday, 1=Sunday, ...) to JavaScript's getDay() equivalent (0=Sunday, 1=Monday, ...)
    // This mapping is achieved by (hValue + 6) % 7
    return (hValue + 6) % 7;
}

function processAllRecords() {
    const rawPayload = fileSystemBridge.readFileSync(process.stdin.fd, 'utf8');
    const records = rawPayload.split(/\r?\n/).filter(Boolean); // Split into lines and remove any empty ones

    const dayDesignations = ['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const fixedYear = 2004;

    records.forEach(lineContent => {
        const lineParts = lineContent.match(/^(\d+)\s+(\d+)$/); // Extract two numbers from the line

        if (lineParts && +lineParts[1] > 0 && +lineParts[2] > 0) { // Check if both numbers are positive
            const numericalMonth = +lineParts[1];
            const numericalDay = +lineParts[2];
            
            const calculatedDayIndex = determineWeekDay(fixedYear, numericalMonth, numericalDay);
            console.log(dayDesignations[calculatedDayIndex]);
        }
    });
}

processAllRecords();