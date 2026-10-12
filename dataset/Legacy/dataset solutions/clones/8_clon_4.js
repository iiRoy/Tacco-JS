const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
const processedNumbers = dataStream.split('\n').map(val => Number(val));
processedNumbers.sort((valA, valB) => valA - valB);
processedNumbers.reverse();
processedNumbers.slice(0, 3).forEach(num => console.log(num));
