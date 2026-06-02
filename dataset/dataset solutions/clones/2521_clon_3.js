'use strict';

const parseNumbersFromString = (numberStringSegment) => {
    const stringComponents = numberStringSegment.split(' ');
    const numericValues = stringComponents.map(component => parseInt(component, 10));
    return numericValues;
};

const processInputData = function (rawInputString) {
    const inputLinesArray = rawInputString.split('\n');
    console.log(inputLinesArray);

    const firstLineContent = inputLinesArray[0];
    const parsedParameters = parseNumbersFromString(firstLineContent);

    const totalFriendsCount = parsedParameters[0];
    const minimumRequiredHeight = parsedParameters[1];

    const secondLineContent = inputLinesArray[1];
    const individualFriendHeights = parseNumbersFromString(secondLineContent);

    const friendsMeetingHeightRequirement = individualFriendHeights.filter(
        (currentFriendHeight) => {
            const isHeightSufficient = currentFriendHeight >= minimumRequiredHeight;
            return isHeightSufficient;
        }
    );
    const numberOfEligibleFriends = friendsMeetingHeightRequirement.length;

    console.log(numberOfEligibleFriends);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
