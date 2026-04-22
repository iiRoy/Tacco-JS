const dataAcquisition = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const textFragments = dataAcquisition.trim().split('\n');

const [configurationString, ...contentElements] = textFragments;
const [itemCount, limitValue] = configurationString.split(' ').map(Number);

const initialResult = "kogakubu10gokan";

const finalOutcome = contentElements.slice(0, itemCount).reduce((currentAccumulation, lineEntry) => {
    const [numericParameter, textualParameter] = lineEntry.split(' ');
    const numericConversion = Number(numericParameter);

    return (numericConversion <= limitValue) ? textualParameter : currentAccumulation;
}, initialResult);

console.log(finalOutcome);