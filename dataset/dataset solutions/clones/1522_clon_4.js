const fileSystemHandler = require("fs");
const entryLocation = "/dev/stdin";
const dataEncoding = "utf8";

const textualContent = fileSystemHandler.readFileSync(entryLocation, dataEncoding);

const integerValue = parseInt(textualContent, 10);

let baseTwoForm = integerValue.toString(2);

const terminalBit = baseTwoForm.charAt(baseTwoForm.length - 1);

let adjustedBaseTwo;
if (terminalBit === '0') {
    adjustedBaseTwo = baseTwoForm.substring(0, baseTwoForm.length - 1) + '1';
} else {
    adjustedBaseTwo = baseTwoForm.substring(0, baseTwoForm.length - 1) + '0';
}

const outcomeNumber = parseInt(adjustedBaseTwo, 2);

console.log(outcomeNumber);