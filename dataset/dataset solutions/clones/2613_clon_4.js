const acquireNumericalParameters = () => {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const extractedParts = rawInputContent.trim().split(' ');
    return extractedParts.map(Number);
};

const createNumberSequence = (initialPoint, terminalPoint) => {
    return Array.from({ length: terminalPoint - initialPoint + 1 }, (_, idx) => initialPoint + idx);
};

const evaluateDateCriteria = () => {
    const [upperMonthLimit, upperDayLimit] = acquireNumericalParameters();

    const possibleMonths = createNumberSequence(1, upperMonthLimit);
    const possibleDays = createNumberSequence(22, upperDayLimit);

    const compliantDateTally = possibleMonths.reduce((totalCountAccumulator, currentMonthIndex) => {
        return totalCountAccumulator + possibleDays.filter(currentDayIndex => {
            const dayDigitMajor = Math.floor(currentDayIndex / 10);
            const dayDigitMinor = currentDayIndex % 10;
            return dayDigitMajor >= 2 && dayDigitMinor >= 2 && (dayDigitMajor * dayDigitMinor === currentMonthIndex);
        }).length;
    }, 0);

    console.log(compliantDateTally);
};

evaluateDateCriteria();