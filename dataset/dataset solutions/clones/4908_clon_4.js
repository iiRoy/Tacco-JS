'use strict';

const fileSystemHandler = require("fs");
const receivedData = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
const stringComponents = receivedData.trim().split(" ");

const primaryValue = stringComponents[0];
const secondaryValue = stringComponents[1];
const tertiaryValue = stringComponents[2];

const uniqueIdentities = new Set([primaryValue, secondaryValue, tertiaryValue]);

let determinationResult;

switch (uniqueIdentities.size) {
  case 1:
    determinationResult = 1;
    break;
  case 2:
    determinationResult = 2;
    break;
  case 3:
    determinationResult = 3;
    break;
  default:
    determinationResult = 0; // Should not occur with exactly three inputs
}

console.log(determinationResult);