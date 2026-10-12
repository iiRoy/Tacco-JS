"use strict";

const parseSpaceSeparatedNumbers = (inputString) => {
    return inputString.split(' ').map(val => parseInt(val, 10));
};

const getFileContent = (filePath) => {
    return require('fs').readFileSync(filePath, 'utf8');
};

const processInput = (rawData) => {
   const lines = rawData.trim().split('\n');

   const totalItems = Number(lines[0]);

   const thresholdLineParts = lines[1].split(" ");
   const thresholdA = Number(thresholdLineParts[0]);
   const thresholdB = Number(thresholdLineParts[1]);

   const groupOne = [];
   const groupTwo = [];
   const groupThree = [];

   const itemValues = parseSpaceSeparatedNumbers(lines[2]);

   for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
     const currentItem = itemValues[itemIndex];

     if (currentItem <= thresholdA) {
       groupOne.push(currentItem);
     } else if (currentItem <= thresholdB) {
       groupTwo.push(currentItem);
     } else {
       groupThree.push(currentItem);
     }
   }

   const lengths = [groupOne.length, groupTwo.length, groupThree.length];
   const resultCount = Math.min(...lengths);

   console.log(resultCount);
};

const standardInputPath = '/dev/stdin';
const inputData = getFileContent(standardInputPath);
processInput(inputData);
