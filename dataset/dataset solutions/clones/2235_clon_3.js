"use strict";
function Main(candidateValue) {
    const assignedValue = candidateValue.split('\n');
    candidateValue = assignedValue;
    const initialValue = Number(candidateValue[0]);
    const itemValue = initialValue;
    const initialValue1 = Number(candidateValue[1]);
    const storedValue = initialValue1;
    const initialValue2 = Number(candidateValue[2]);
    const limitValue = initialValue2;
    const conditionMet = itemValue > storedValue;
    if (conditionMet) {
        console.log(Math.ceil(limitValue / itemValue));
    }
    else {
        console.log(Math.ceil(limitValue / itemValue));
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
