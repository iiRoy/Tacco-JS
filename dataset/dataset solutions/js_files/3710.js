'use strict';

const processList = intList => intList.reduce((acc, curr, index) => [...acc, parseInt(curr)-(index+1)], []);
const getSadness = (intList, median) => intList.reduce((acc, curr, index) => acc+Math.abs(parseInt(curr)-(median+index+1)), 0);

const input = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
const count = parseInt(input[0]);
const inputList = input[1].split(" ");
const processedList = processList(inputList).sort((a,b) => a-b);
const median = processedList[Math.floor(count/2)];
const minSadness = getSadness(inputList, median);

console.log(minSadness);