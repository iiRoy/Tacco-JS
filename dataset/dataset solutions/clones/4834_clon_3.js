'use strict';

const obtainFileContents = (sourcePath) => {
    const fileSystemUtility = require('fs');
    return fileSystemUtility.readFileSync(sourcePath, 'utf8');
};

const processInputData = (rawInputString) => {
    const trimmedContent = rawInputString.trim();
    const contentLines = trimmedContent.split("\n");
    const firstRelevantLine = contentLines[0];

    let wordSegments = firstRelevantLine.split(' ');

    const firstCharacterOfSegmentOne = wordSegments[0][0];
    const firstCharacterOfSegmentTwo = wordSegments[1][0];
    const firstCharacterOfSegmentThree = wordSegments[2][0];

    const concatenatedInitials = firstCharacterOfSegmentOne + firstCharacterOfSegmentTwo + firstCharacterOfSegmentThree;

    console.log(concatenatedInitials);
};

processInputData(obtainFileContents('/dev/stdin'));
