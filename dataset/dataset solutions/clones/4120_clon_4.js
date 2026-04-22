const isDigitCharacter = (symbol) => symbol >= '0' && symbol <= '9';

const executeValidationProcess = (rawData) => {
  const inputLines = rawData.trim().split('\n');

  const [lenOneStr, lenTwoStr] = inputLines[0].split(' ');
  const lengthPartOne = Number(lenOneStr);
  const lengthPartTwo = Number(lenTwoStr);

  const stringToExamine = inputLines[1];

  const requiredTotalLength = lengthPartOne + lengthPartTwo + 1;
  if (stringToExamine.length !== requiredTotalLength) {
    console.log('No');
    return;
  }

  if (stringToExamine.charAt(lengthPartOne) !== '-') {
    console.log('No');
    return;
  }

  const firstSegment = stringToExamine.substring(0, lengthPartOne);
  if (!Array.from(firstSegment).every(isDigitCharacter)) {
    console.log('No');
    return;
  }

  const secondSegment = stringToExamine.substring(lengthPartOne + 1);
  if (!Array.from(secondSegment).every(isDigitCharacter)) {
    console.log('No');
    return;
  }

  console.log('Yes');
};

executeValidationProcess(require("fs").readFileSync("/dev/stdin", "utf8"));