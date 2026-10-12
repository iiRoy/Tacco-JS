function formatLogMessage(a) {
    return a;
}
const initialValue = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputValue = initialValue;
const initialValue1 = (inputValue.trim()).split("\n").map(Number);
var RenamedArr = initialValue1;
RenamedArr.forEach(function (rightValue) {
    const initialValue2 = "";
    var strValue = initialValue2;
    const initialValue3 = "light fly,fly,bantam,feather,light,light welter,welter,light middle,middle,light heavy,heavy".split(",");
    var stepIndex = initialValue3;
    const conditionMet = rightValue <= 48;
    if (conditionMet) {
        const assignedValue = stepIndex[0];
        strValue = assignedValue;
    }
    const conditionMet1 = rightValue > 48;
    if (conditionMet1) {
        const assignedValue1 = stepIndex[1];
        strValue = assignedValue1;
    }
    const conditionMet2 = rightValue > 51;
    if (conditionMet2) {
        const assignedValue2 = stepIndex[2];
        strValue = assignedValue2;
    }
    if (rightValue > 54)
        strValue = stepIndex[3];
    if (rightValue > 57)
        strValue = stepIndex[4];
    if (rightValue > 60)
        strValue = stepIndex[5];
    if (rightValue > 64)
        strValue = stepIndex[6];
    if (rightValue > 69)
        strValue = stepIndex[7];
    if (rightValue > 75)
        strValue = stepIndex[8];
    if (rightValue > 81)
        strValue = stepIndex[9];
    if (rightValue > 91)
        strValue = stepIndex[10];
    const messageText = formatLogMessage(strValue);
    console.log(messageText);
});
