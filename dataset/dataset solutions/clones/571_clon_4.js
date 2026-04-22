const fileSystemInterface = require('node:fs');
const rawDataString = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const lineElements = rawDataString.trim().split('\n');

const processedReports = lineElements.map(singleLineText => {
    const initialSize = singleLineText.length;

    const withoutJoi = singleLineText.replace(/JOI/g, '');
    const joiFound = (initialSize - withoutJoi.length) / 3;

    const withoutIoi = singleLineText.replace(/IOI/g, '');
    const ioiFound = (initialSize - withoutIoi.length) / 3;

    return {
        jCounter: joiFound,
        iCounter: ioiFound
    };
});

processedReports.forEach(reportItem => {
    console.log(reportItem.jCounter);
    console.log(reportItem.iCounter);
});