const inputSource = require("node:fs").readFileSync(0, "utf8");

let firstDelimiter = inputSource.indexOf('\n');
let secondDelimiter = inputSource.indexOf('\n', firstDelimiter + 1);

let valOne = parseInt(inputSource.substring(0, firstDelimiter), 10);
let valTwo = parseInt(inputSource.substring(firstDelimiter + 1, secondDelimiter), 10);
let valThree = parseInt(inputSource.substring(secondDelimiter + 1), 10);

let differenceResult = valOne - valTwo;
let finalCalculation = differenceResult - Math.trunc(differenceResult / valThree) * valThree;

process.stdout.write(finalCalculation + '\n');