const fileSystemUtility = require("fs");

const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const rawInputContent = fileSystemUtility.readFileSync(standardInputPath, textEncoding);

const firstCharacter = rawInputContent[0];
const secondCharacter = rawInputContent[2];
const thirdCharacter = rawInputContent[4];

const numericValueA = Number(firstCharacter);
const numericValueB = Number(secondCharacter);
const numericValueC = Number(thirdCharacter);

const calculatedSum = (numericValueA * 100) + (numericValueB * 10) + (numericValueC * 1);

const isDivisibleByFour = (calculatedSum % 4 === 0);

const affirmativeOutput = 'YES';
const negativeOutput = 'NO';

const finalMessage = isDivisibleByFour ? affirmativeOutput : negativeOutput;

console.log(finalMessage);
