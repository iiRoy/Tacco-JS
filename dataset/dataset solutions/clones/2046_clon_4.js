const paramRaw = process.argv[2];
const numericalValue = parseFloat(paramRaw);
const thirdPart = numericalValue / 3;
const computedResult = thirdPart * thirdPart * thirdPart;
process.stdout.write(computedResult.toString() + '\n');