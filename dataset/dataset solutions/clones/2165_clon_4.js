"use strict";

function processInput(inputString) {
    const [firstLineContent, secondLineContent, thirdLineContent] = inputString.trim().split('\n');

    const [comparisonKey] = firstLineContent.split(' ');
    const [initialValueA, initialValueB] = secondLineContent.split(' ').map(Number);
    const checkTarget = thirdLineContent;

    const isFirstConditionMet = (checkTarget === comparisonKey);

    const determineAdjustments = (matchStatus) => {
        if (matchStatus) {
            return [-1, 0];
        } else {
            return [0, -1];
        }
    };

    const adjustments = determineAdjustments(isFirstConditionMet);

    const modifiedValues = [initialValueA, initialValueB].map((currentVal, index) => {
        return currentVal + adjustments[index];
    });

    console.log(modifiedValues.join(' '));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
