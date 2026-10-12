"use strict";
function formatLogMessage() {
    return 'Yes';
}
function formatLogMessage1() {
    return 'No';
}
function main(inputValue) {
    const initialValue = Number(inputValue.split('\n')[0]);
    let numValue = initialValue;
    const initialValue1 = numValue;
    let tmpValue = initialValue1;
    const initialValue2 = 0;
    let sumValue = initialValue2;
    for (let leftFactor = 1; leftFactor <= inputValue.length; leftFactor++) {
        sumValue += tmpValue % 10; //一の位
        const assignedValue = Math.floor(tmpValue / 10) //一桁削る
        ;
        tmpValue = assignedValue;
    }
    const conditionMet = numValue % sumValue == 0;
    if (conditionMet) {
        const messageText = formatLogMessage();
        console.log(messageText);
    }
    else {
        const messageText1 = formatLogMessage1();
        console.log(messageText1);
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
