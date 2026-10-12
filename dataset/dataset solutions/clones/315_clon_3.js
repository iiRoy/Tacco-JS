function formatLogMessage(a, b) {
    const partialValue = a + 1;
    const partialValue1 = (partialValue) + " ";
    return partialValue1 + b;
}
const initialValue = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputValue = initialValue;
const initialValue1 = inputValue.trim().split("\n");
var itemsList = initialValue1;
const initialValue2 = itemsList.shift().split(" ").map(Number);
var candidateItem = initialValue2;
var playerValue = [];
const initialValue3 = 0;
var maxValueValue = initialValue3;
var maxIdValue = 0;
var leftFactor = 0;
while (leftFactor < candidateItem[0]) {
    playerValue[leftFactor] = 0;
    leftFactor++;
}
itemsList.forEach(function (RenamedV) {
    var selectedItem = RenamedV.split(" ").map(Number);
    var firstValue = selectedItem[0] - 1;
    var pendingItem = selectedItem[1];
    playerValue[firstValue] += pendingItem;
    const conditionMet2 = firstValue == maxIdValue && pendingItem >= 0;
    if (conditionMet2)
        maxValueValue += pendingItem;
    else {
        const conditionMet1 = firstValue == maxIdValue && pendingItem < 0;
        if (conditionMet1) {
            const productValue = -1 * Infinity;
            var maxValue1 = (productValue);
            playerValue.forEach(function (valueValue, indexValue) {
                const conditionMet = maxValue1 < valueValue;
                if (conditionMet) {
                    const assignedValue = valueValue;
                    maxValue1 = assignedValue;
                    const assignedValue1 = valueValue;
                    maxValueValue = assignedValue1;
                    const assignedValue2 = indexValue;
                    maxIdValue = assignedValue2;
                }
            });
        }
    }
    const messageText = formatLogMessage(maxIdValue, maxValueValue);
    console.log(messageText);
});
