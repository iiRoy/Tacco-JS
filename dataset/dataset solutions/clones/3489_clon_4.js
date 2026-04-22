const obtainSourceContent = require('node:fs').readFileSync;

const processExecution = (sourcePath) => {
    const rawDataSections = obtainSourceContent(sourcePath, 'utf8').split('\n');

    const [primaryConfig, ...taskDetails] = rawDataSections;
    const [_, maxDuration] = primaryConfig.split(' ').map(Number);

    const viableChoices = taskDetails
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(entry => {
            const [costValue, timeValue] = entry.split(' ').map(Number);
            return { costValue, timeValue };
        })
        .filter(item => item.timeValue <= maxDuration);

    const resultingMinimum = viableChoices.reduce((acc, currentItem) => {
        return Math.min(acc, currentItem.costValue);
    }, Infinity);

    console.log(resultingMinimum === Infinity ? 'TLE' : resultingMinimum);
};

processExecution('/dev/stdin');