'use strict';
function formatLogMessage(a) {
    return a;
}
function main(inputValue) {
    const assignedValue = inputValue.split('\n');
    inputValue = assignedValue;
    const initialValue = ~~inputValue[0];
    const limitValue = initialValue;
    const initialValue1 = inputValue[1];
    const troopersValue = initialValue1;
    const accumulationValue = [0];
    //Array.apply(null, {
    //   length: n + 1
    // }).map(v => 0)
    for (let leftFactor = 0; leftFactor < limitValue; leftFactor++) {
        const conditionMet = troopersValue[leftFactor] == 'E';
        if (conditionMet) {
            accumulationValue[leftFactor + 1] = accumulationValue[leftFactor] + 1;
        }
        else {
            accumulationValue[leftFactor + 1] = accumulationValue[leftFactor];
        }
    }
    const initialValue2 = Number.MAX_SAFE_INTEGER;
    let minValue = initialValue2;
    for (let leftFactor = 1; leftFactor <= limitValue; leftFactor++) {
        const initialValue3 = leftFactor - 1 - accumulationValue[leftFactor - 1] // 左側のWの数
        ;
        let workingIndex = initialValue3 // 左側のWの数
        ;
        let caughtError = accumulationValue[limitValue] - accumulationValue[leftFactor - 1];
        const initialValue4 = workingIndex + caughtError;
        let tmpValue = initialValue4
        // console.log(w, e)
        ;
        const assignedValue1 = minValue > tmpValue ? tmpValue : minValue;
        minValue = assignedValue1;
    }
    const messageText = formatLogMessage(minValue);
    console.log(messageText);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
