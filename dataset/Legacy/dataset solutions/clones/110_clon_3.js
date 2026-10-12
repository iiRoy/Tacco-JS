process.stdin.on("data", function(inputBuffer) {
    const dayNamePrefixes = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"];
    const fixedReferenceYear = 2004;

    let calendarDate = new Date();
    calendarDate.setFullYear(fixedReferenceYear);

    const rawInputString = String(inputBuffer);
    const processedInputLines = rawInputString.trim().split("\n");

    const parseDateLine = (lineContent) => {
        const parts = lineContent.split(" ");
        const monthNumber = parseInt(parts[0], 10);
        const dayNumber = parseInt(parts[1], 10);

        if (isNaN(monthNumber) || monthNumber === 0) {
            return null;
        }
        return { month: monthNumber, day: dayNumber };
    };

    const getFullDayName = (dayIndex, prefixesArray) => {
        return prefixesArray[dayIndex] + "day";
    };

    processedInputLines.some(function(currentLine) {
        const dateComponents = parseDateLine(currentLine);

        if (dateComponents === null) {
            return true;
        }

        const zeroIndexedMonth = dateComponents.month - 1;
        const dayOfMonth = dateComponents.day;

        calendarDate.setMonth(zeroIndexedMonth, dayOfMonth);

        const dayOfWeek = calendarDate.getDay();
        const outputDayString = getFullDayName(dayOfWeek, dayNamePrefixes);

        console.log(outputDayString);

        return false;
    });
}).resume();
