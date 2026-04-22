const processNumericalInput = (rawData) => {
    const adjustedData = rawData.replace(/\s+/g, ' ').trim();
    const numericTokens = adjustedData.split(' ').map(Number);

    const firstQuantity = numericTokens[0];
    const secondQuantity = numericTokens[1];

    const calendarPeriodGroups = [
        0,
        10, // Jan (31 days)
        30, // Feb (28/29 days)
        10, // Mar (31 days)
        20, // Apr (30 days)
        10, // May (31 days)
        20, // Jun (30 days)
        10, // Jul (31 days)
        10, // Aug (31 days)
        20, // Sep (30 days)
        10, // Oct (31 days)
        20, // Nov (30 days)
        10  // Dec (31 days)
    ];

    const categoryForFirst = calendarPeriodGroups[firstQuantity];
    const categoryForSecond = calendarPeriodGroups[secondQuantity];

    return (categoryForFirst === categoryForSecond) ? "Yes" : "No";
};

const acquireSource = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processNumericalInput(acquireSource));