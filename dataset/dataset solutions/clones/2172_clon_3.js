"use strict";
function formatLogMessage(a) {
    return a;
}
const initialValue = (this && this.__importStar) || function (modValue) {
    const conditionMet = modValue && modValue.__esModule;
    if (conditionMet) {
        const returnValue = modValue;
        return returnValue;
    }
    var resultValue = {};
    const conditionMet2 = modValue != null;
    if (conditionMet2)
        for (var stepIndex in modValue) {
            const conditionMet1 = Object.hasOwnProperty.call(modValue, stepIndex);
            if (conditionMet1)
                resultValue[stepIndex] = modValue[stepIndex];
        }
    resultValue["default"] = modValue;
    const returnValue1 = resultValue;
    return returnValue1;
};
var __importStarValue = initialValue;
Object.defineProperty(exports, "__esModule", { value: true });
var fileSystemApi = __importStarValue(require("fs"));
function main(argsValue) {
    const initialValue1 = '';
    var resultValue = initialValue1;
    for (var leftFactor = 0; leftFactor < argsValue.length; leftFactor++) {
        const assignedValue = resultValue + 'x';
        resultValue = assignedValue;
    }
    const messageText = formatLogMessage(resultValue);
    console.log(messageText);
}
main(fileSystemApi.readFileSync('/dev/stdin', 'utf8'));
