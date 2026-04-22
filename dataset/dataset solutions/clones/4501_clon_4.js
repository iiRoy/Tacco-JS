"use strict";
const obtainData = () => require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf-8' });

const processInputLine = (textContents) => {
    const extractedNumerals = textContents.match(/\d+/g);
    return extractedNumerals.slice(0, 3).map(Number);
};

const getConclusion = (firstValue, secondValue, thirdValue) => {
    const outcomeMapping = {
        0: 'delicious',
        1: 'dangerous',
        2: 'safe',
        3: ''
    };

    const isFirstConditionMet = (secondValue >= thirdValue);
    const calculatedDifference = thirdValue - secondValue;
    const adjustedFirstValue = firstValue + 1;

    const isSecondConditionMet = (!isFirstConditionMet && (adjustedFirstValue < calculatedDifference));
    const isThirdConditionMet = (!isFirstConditionMet && (adjustedFirstValue > calculatedDifference));
    const isFourthConditionMet = (!isFirstConditionMet && (adjustedFirstValue === calculatedDifference));

    const resultantKey = (isFirstConditionMet * 0) +
                         (isSecondConditionMet * 1) +
                         (isThirdConditionMet * 2) +
                         (isFourthConditionMet * 3);

    return outcomeMapping[resultantKey];
};

const executeProgram = () => {
    const rawInputContent = obtainData();
    const [alpha, beta, gamma] = processInputLine(rawInputContent);
    const finalOutputString = getConclusion(alpha, beta, gamma);
    console.log(finalOutputString);
};

executeProgram();