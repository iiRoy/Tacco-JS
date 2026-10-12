"use strict";

const fileSystemHandler = require('fs');

const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'UTF-8');

const contentLines = rawInputContent.split('\n');

const numericInput = contentLines[0];

const finalCubicValue = numericInput * numericInput * numericInput;

console.log(finalCubicValue);
