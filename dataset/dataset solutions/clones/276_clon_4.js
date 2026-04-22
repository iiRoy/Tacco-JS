const eraDefinitions = [
    { startValue: 19890108, designation: 'heisei', yearOffset: 1988 },
    { startValue: 19261225, designation: 'showa',  yearOffset: 1925 },
    { startValue: 19120730, designation: 'taisho', yearOffset: 1911 },
    { startValue: 18680908, designation: 'meiji',  yearOffset: 1867 }
];

const dateConverter = (yearly, monthly, daily) => yearly * 10000 + monthly * 100 + daily;

const processEntry = (entryText) => {
    const components = entryText.split(' ').map(Number);
    const targetYear = components[0];
    const targetMonth = components[1];
    const targetDay = components[2];

    const dateValue = dateConverter(targetYear, targetMonth, targetDay);

    let identifiedEra = 'pre-meiji';
    let calculatedYear = targetYear;

    for (const eraDefinition of eraDefinitions) {
        if (dateValue >= eraDefinition.startValue) {
            identifiedEra = eraDefinition.designation;
            calculatedYear = targetYear - eraDefinition.yearOffset;
            break;
        }
    }

    if (identifiedEra === 'pre-meiji') {
        return 'pre-meiji';
    } else {
        return `${identifiedEra} ${calculatedYear} ${targetMonth} ${targetDay}`;
    }
};

const dataSource = require('fs');

const rawContent = dataSource.readFileSync('/dev/stdin', 'utf8');
const contentRows = rawContent.trim().split('\n');

const processedResults = contentRows.map(processEntry);

processedResults.forEach(resultLine => console.log(resultLine));