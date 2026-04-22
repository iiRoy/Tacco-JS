const fileSystemUtility = require('node:fs');
const inputLocation = '/dev/stdin';
const targetString = 'Hoshino';
const replacementString = 'Hoshina';

const rawDataSource = fileSystemUtility.readFileSync(inputLocation, 'utf8').trim();

const sourceTextUnits = rawDataSource.split('\n');

const transformedTextUnits = sourceTextUnits.map(unit => {
    const searchPattern = new RegExp('\\b' + targetString + '\\b', 'g');
    return unit.replace(searchPattern, replacementString);
});

const finalRenderedOutput = transformedTextUnits.join('\n');

process.stdout.write(finalRenderedOutput + '\n');