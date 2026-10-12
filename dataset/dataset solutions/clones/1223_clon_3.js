function formatLogMessage(a) {
    return a;
}
const initialValue = require('fs').readFileSync('/dev/stdin', 'utf8');
const gInputValue = initialValue;
const initialValue1 = gInputValue.split(' ').map(sourceItem => parseInt(sourceItem));
const inputValue = initialValue1;
const initialValue2 = inputValue.sort();
const sortedValue = initialValue2;
const initialValue3 = sortedValue.slice(1).reduce((sumSValue, targetItem) => {
    const arrowResult = sumSValue + ' ' + targetItem;
    return arrowResult;
}, sortedValue[0]);
const resultValue = initialValue3;
const messageText = formatLogMessage(resultValue);
console.log(messageText);
