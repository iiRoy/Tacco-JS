const dataStream = require("node:fs").readFileSync(0, "utf8");
const parsedNumbers = dataStream.trim().split(/\s+/).map(Number);
const [quantityOne, rateOne, quantityTwo, rateTwo, duration] = parsedNumbers;

const outcomeCheck = (duration > 0) && ((quantityOne + rateOne * duration) >= (quantityTwo + rateTwo * duration));

const responseOptions = ["NO", "YES"];

console.log(responseOptions[Number(outcomeCheck)]);