const acquireInputData = () => {
    const fileSystemModule = require('node:fs');
    const filePathDescriptor = '/dev/stdin';
    const dataEncoding = 'utf8';
    return fileSystemModule.readFileSync(filePathDescriptor, dataEncoding);
};

function processSeasonalDate(rawInputString) {
    const numericDay = Number(rawInputString);

    const holidayMessages = new Map();
    holidayMessages.set(25, 'Christmas');
    holidayMessages.set(24, 'Christmas Eve');
    holidayMessages.set(23, 'Christmas Eve Eve');

    const defaultMessage = 'Christmas Eve Eve Eve';

    const finalAnnouncement = holidayMessages.get(numericDay) || defaultMessage;

    outputDisplay(finalAnnouncement);
}

const outputDisplay = console.log;

processSeasonalDate(acquireInputData());